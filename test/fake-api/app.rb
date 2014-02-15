# encoding: UTF-8

require 'rubygems'
require 'bundler/setup'
require 'json'

Bundler.require(:default)

TogglScheme = 'https'
TogglHost = 'toggl.com'

configure do
  enable :cross_origin

  unless settings.respond_to?(:expose_headers)
    set :expose_headers, nil
  end

  set :protection, :except => [ :http_origin ]
  set :allow_methods, [ :get, :post, :put, :patch, :delete, :options ]
  set :allow_origin, :any
  set :allow_headers, ["*", "Content-Type", "Accept", "AUTHORIZATION", "Cache-Control", 'X-Requested-With']
  set :allow_credentials, true
  set :max_age, '1728000'
end

options '*' do
  response.headers['Access-Control-Max-Age'] = '1728000'

  halt 200
end

before do
  content_type :json

  @auth ||=  Rack::Auth::Basic::Request.new(request.env)

  if @auth.provided?
    if @auth.basic? && @auth.credentials
      puts "Credentials: #{@auth.credentials}"
      @api_token = @auth.credentials.first
    end
  end
end

get '*' do |endpoint|
  puts "intercepting endpoint: #{endpoint}"
  puts params.inspect

  host = if @api_token
    [ TogglScheme, '://', @api_token, ':api_token@', TogglHost ].join('')
  else
    [ TogglScheme, '://', TogglHost ].join('')
  end

  url = [ host, endpoint ].join('/')

  query_params = params.clone
  query_params.delete('splat')
  query_params.delete('captures')

  options = {
    accept: :json,
    params: query_params
  }

  RestClient.get(url, options) do |resp, req, res|
    halt resp.code, resp.body
  end
end