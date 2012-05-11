#!/usr/bin/env ruby
# Use Sinatra to serve up a directory of your choice on localhost. 
# Usage: serve_directory.rb directory [-p port]
unless ARGV.size > 0
  puts "Usage: serve_directory.rb directory [-p port]"
  exit
end

require "rubygems"
require "sinatra"
require "find"

class AddAccessControlHeader
  attr_reader :app
  def initialize(app, options = {}); @app = app; end

  def call(env)
    # status, headers, body = @app.call(env)
    status, headers, body = Rack::Static.new(app,
        :urls => ["/"], :root => "./").call(env)
    # So that files served from this web server can be pulled in from cross domain ajax.
    headers["Access-Control-Allow-Origin"] = "*"
    return [status, headers, body]
  end
end

# public_directory = ARGV.first
# set :public, public_directory

use AddAccessControlHeader

# If we browse to the root of the web server and there is no index.html file, generate our own.
get "/" do
  index_file = File.join(public_directory, "index.html")
  if File.exists? index_file
    File.read(index_file)
  else
    output = []
    Find.find(public_directory) do |filename|
      filename = filename[public_directory.size..-1]
      # Strip off the initial slash; this happens if serve_directory.rb's first argument does not have a slash
      filename = filename[1..-1] if filename.index("/") == 0
      next unless filename.size > 0
      output.push("<a href='/#{filename}'>#{filename}</a><br/>")
    end
    output.join
  end
end
