require 'rake'
require 'packr'

desc 'Builds the distribution'
task :dist do
  src_dir  = File.expand_path('../src', __FILE__)
  dist_dir = File.expand_path('../dist', __FILE__)
  
  source = File.read File.join(src_dir, 'classify.js')
  
  File.open(File.join(dist_dir, 'classify.js'), 'w') do |file|
    file.write source.strip
  end
  
  File.open(File.join(dist_dir, 'classify.min.js'), 'w') do |file|
    file.write Packr.pack(source, :shrink_vars => true).strip
  end
end

task :default => :dist
