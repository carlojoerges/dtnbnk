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
  
  post '/item' do
    content = JSON.parse(request.params['json'])
    item = nil
    if content.has_key?("id") 
      item = Item[content["id"]]
      content = item.to_hash().merge(content)
      content.delete(:id)
      content.delete("id")
      item.update(:content => content.to_json)
    else
      item = Item.create(:content => content.to_json)
    end
    item.to_json
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
  
  post '/testquery' do
    query = JSON.parse(request.params['json'])
    Item.dataset.filter_all(query).to_json
  end

  # so und jetzt kann man doch hier mal alle tags für ein object holen
  get '/all/:type/for/:id' do
    Item[params[:id]].getassociated(params[:type]).to_json
  end
