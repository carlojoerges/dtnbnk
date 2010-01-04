require "rubygems"
require 'sinatra'
require 'sinatra/sequel'
require 'json'
#
# Setup Database
#
set :database, "sqlite://development.sqlite3"
migration "Create Items" do
  database.create_table :items do
    primary_key :id
    String :content, :default => "{}"
  end
end
migration "Create Associations" do
  database.create_table :associations do
    primary_key :id
    foreign_key :mid, :items
    foreign_key :iid, :items
  end
end

# ... weitere Migrations kommen später hinzu


#
# Setup Models
#
class Item < Sequel::Model
  Item.many_to_many :forward_items, :class => Item, :join_table => :associations, :left_key => :mid, :right_key => :iid
  Item.many_to_many :backward_items, :class => Item, :join_table => :associations, :left_key => :iid, :right_key => :mid
  
  class << self
    alias :original_all :all
    def all
      Item.original_all.map{|item| item.to_hash}
    end

    alias :original_filter :filter
    def filter(args)
      Item.original_filter(args).map{|item| item.to_hash}
    end

  end
  
  # das sollte man mit einer dieser anonymen funktionen ersetzen
  def getassociated(type)
    self.forward_items_dataset.filter("content LIKE '%type\":\"#{type}%'")
  end
  
  def pushtoself(type,item)
    if values.has_key?(type+"s")
      if values[type+"s"].is_a?(Array)
         values[type+"s"] << item.values
      else 
        false
      end
    else
      values[type+"s"] = [item.values]
    end
  end
  
  def mergeitems(type, ds)
    values[type+"s"] = ds.all unless values.has_key?(type+"s")
    self
  end
  
  def mergeall()
    self.forward_items.each do |it|
      data = it.mergeall().to_hash
      if data.has_key?("type")
        pushtoself("item",it) unless pushtoself(data["type"],it)
      else
        pushtoself("item",it)
      end
    end
    self
  end

  def to_hash
    # vorsicht: wenn im content array z.b. ein key :id ist, wird der überschrieben!
    # evtl. lösung dafür finden.
    if values.has_key?(:content)
      values.merge!(JSON.parse(values.delete(:content)))
    else
      values
    end
  end

  def to_json
    self.to_hash.to_json
  end
end


class QueryParser
  def initialize(query)
    @all_conditions = parse(query)
  end
  
  def conditions
    @all_conditions ||= {}
  end
  
  def parse(query)
    conditions = query.delete(:conditions) || query
    if conditions.is_a?(Hash)
      conditions_array = []
      conditions.each do |column, hash_conditions|
        if hash_conditions.is_a?(Hash)
          hash_conditions.each do |operator, value|
            conditions_array << Condition.new(column, value, operator)
          end
        else
          conditions_array << Condition.new(column, hash_conditions, "eq")
        end
      end
      conditions = conditions_array
    end
    conditions_array
  end
end

class Condition
    attr_reader :column, :value, :operator
    
    OPERATOR_MAPPING = {
      'lt'    => '<',
      'gt'    => '>',
      'gteq'  => '>=',
      'lteq'  => '<=',
      'eq'    => '=',
      'neq'   => '!=',
      'is'    => 'IS',
      'not'   => 'IS NOT',
      'like'  => 'LIKE',
      'in'    => 'IN',
      'notin' => 'NOT IN'
    }.freeze
      
    CONVERTABLE_VALUES = {
      ':true'  => true,
      ':false' => false,
      ':nil'   => nil,
      ':null'  => nil
    }.freeze
  
    
    def initialize(column, value, operator = '=')
      self.column   = column
      self.operator = operator
      self.value    = value
    end
    
    def map_operator(operator_to_look_up, reverse = false)
      mapping = reverse ?  OPERATOR_MAPPING.dup.invert : OPERATOR_MAPPING.dup
      return operator_to_look_up if mapping.values.include?(operator_to_look_up)
      found = mapping[operator_to_look_up.to_s]
    end
    
    def operator=(operator)
      @operator = map_operator(operator)
      raise(RestfulQuery::InvalidOperator, "#{@operator} is not a valid operator") unless @operator
    end

    def column=(column)
      @column = column.to_s
    end

    def value=(value)
      @value = parse_value(value)
    end
    
    protected
    def parse_value(value)
      if operator == 'LIKE' 
        "%#{value}%"
      elsif ['IN', 'NOT IN'].include?(operator) && !value.is_a?(Array)
        value.split(',')
      elsif value =~ /^\:/ && CONVERTABLE_VALUES.has_key?(value)
        CONVERTABLE_VALUES[value]
      else
        value
      end
    end

end


module Sequel
  class Dataset
    def filter_all(query)
      nestedqueries = extract_nestedquery(query)
      cond = QueryParser.new(query).conditions
      res = self.all.select do |row|
        test_row(row.to_hash,cond)
      end
      nestedqueries.each do |key, nestedquery|
        res.each do |row|
          row.values["include"] = Hash.new unless row.values.has_key?("include")
          row.values["include"][key] = do_nestedquery(row,key,nestedquery)
        end 
      end
      res
    end
    
    def do_nestedquery(row, key, query)
      ds = row.forward_items_dataset if key == "forward_items"
      ds = row.backward_items_dataset if key == "backward_items"
      res = nil
      if query.is_a?(Hash)
        res = ds.filter_all(query)
      else
        res = ds.all
      end
      res
    end
    
    def extract_nestedquery(query)
      res = Hash.new
      res["forward_items"] = query.delete("forward_items") if query.has_key?("forward_items")
      res["backward_items"] = query.delete("backward_items") if query.has_key?("backward_items")
      res
    end
    
    
    private
    def cond_eq(column, value)
      column == value
    end
    
    
    def test_row(item, conditions)
      res = true
      conditions.each do |c|
        if item.has_key?(c.column)
          res &&= send("cond_"+c.map_operator(c.operator,true).to_s,item[c.column.to_s], c.value)
        else
          res = false
        end
      end
      res
    end
  end
  
end
