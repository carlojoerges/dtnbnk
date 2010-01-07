require 'rubygems'
require 'compass' #must be loaded before sinatra
require 'sinatra'
require 'haml'    #must be loaded after sinatra
require 'sequel'
require 'mini_magick'
require 'dtnbnk'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, "views"
set :static, true
set :public, File.dirname(__FILE__) + '/public'



settings = { 
  :readRequiresLogin  => false
}






configure do
  puts "configure"
  Compass.configuration do |config|
    config.project_path = File.dirname(__FILE__)
    config.sass_dir = File.join("views", 'stylesheets')
    config.output_style = :compact
  end
end

# at a minimum, the main sass file must reside within the ./views directory. here, we create a ./views/stylesheets directory where all of the sass files can safely reside.
get '/stylesheets/:name.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :"stylesheets/#{params[:name]}", Compass.sass_engine_options
end

get '/' do
  haml :index
end

get '/items' do
  content_type :json
  Item.all.to_json
end

def updateOrSave(content)
  item = nil
  if content.has_key?("id") 
    item = Item[content["id"]]
    oldcontent = item.to_hash()
    if oldcontent.has_key?("file") && content.has_key?("file")
      save_delete(oldcontent["file"]) if oldcontent["file"] != content["file"]
    end
    content = oldcontent.merge(content)
    content.delete(:id)
    content.delete("id")
    item.update(:content => content.to_json)
  else
    item = Item.create(:content => content.to_json)
  end
  item
end

post '/item' do
  content = JSON.parse(request.params['json'])
  updateOrSave(content).to_json
end

# hier hab ich testkrams reingemacht - kommt natürlich alles ins model ;-)
# provisorium um associations anzulegen
# die sollten ja später mal aus dem geposteten json automatisch angelegt werden, TODO
get '/assoc/:id/:od' do
  Item[params[:id]].add_forward_item(Item[params[:od]])
  "ok"
end

get '/deassoc/:id/:od' do
  Item[params[:id]].remove_forward_item(Item[params[:od]])
  "ok"
end

# für debug zwecke
get '/assocs/:id' do
  Item[params[:id]].mergeall().to_json
end

get '/delete/:id' do
  item = Item[params[:id]]
  item.remove_all_forward_items
  item.delete
  "ok"
end

post '/authenticate' do
  validate(JSON.parse(request.params['user'])).to_json
end

def validate(user)
  if user.has_key?("user")
    Item.dataset.filter_all(user)
  else
    []
  end
end

def makeError(msg)
  message = Hash.new
  message["type"] = "message"
  message["content"] = msg
  message
end

def query(param)
  unless param.nil?
    query = JSON.parse(param)
    Item.dataset.filter_all(query)
  end
end

post '/testquery' do
  if settings[:readRequiresLogin]
    if request.params['user'] && validate(JSON.parse(request.params['user'])).length == 1
      query(request.params['json']).to_json
    else
      makeError("Not Authorized").to_json
    end
  else
    query(request.params['json']).to_json
  end
end

# so und jetzt kann man doch hier mal alle tags für ein object holen
get '/all/:type/for/:id' do
  Item[params[:id]].getassociated(params[:type]).to_json
end


post '/upload' do
  item = nil
  if params.has_key?("userfile") && params.has_key?("id")
    id = params["id"].to_i
    userfile = params["userfile"][0]
    file = save_uploaded_file(userfile, "uploads")
    item = {
      "id" => id,
      "file" => file
      }
    item = updateOrSave(item)
  end
  item.to_json
end

get '/close' do
  headers['Connection'] = "close"
  "closeme"
end

def save_uploaded_file(file, filepath)
  p file
  fileobj = file[:tempfile]
  oldfilename = file[:filename]
  p oldfilename
  complete_path = 'public/' + filepath
  FileUtils.mkdir_p(complete_path) unless File.exists?(complete_path)
  begin
    filename = unique_and_proper_filename oldfilename
    f = File.open(complete_path + '/' + filename, 'wb')
    f.write(fileobj.read)
    return filepath + '/' + filename        
  rescue
    return false
  ensure
    f.close unless f.nil?
  end
end

def unique_and_proper_filename(filename)
  Time.now.to_i.to_s + '_' + File.basename(filename).gsub(/[^0-9A-Za-z.]/, '')
end

def save_delete(file)
  begin
    File.delete("public/"+file)
  rescue
    puts "E! Could not delete Asset file"
  end
end

