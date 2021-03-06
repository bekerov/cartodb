# encoding: utf-8
gem 'minitest'
require 'minitest/autorun'
require_relative '../../lib/importer/runner'
require_relative '../../lib/importer/job'
require_relative '../../lib/importer/downloader'
require_relative '../factories/pg_connection'

include CartoDB::Importer2

describe 'Importer regression test' do  
  before do
    @pg_options  = Factories::PGConnection.new.pg_options
  end


  Dir[File.join(File.dirname(__FILE__), 'files/*')].each do |file|
    it "correctly imports file #{file}" do
      filepath    = file
      downloader  = Downloader.new(File.expand_path filepath)
      runner      = Runner.new(@pg_options, downloader)
      runner.run

      runner.results.each do |result|
        result[:success].must_equal true
        puts runner.report unless result[:success]
      end

      runner.db.disconnect
    end
  end


  def path_to(filepath)
    File.join(File.dirname(__FILE__), "../fixtures/#{filepath}")
  end #path_to

end 
