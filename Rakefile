require "rake"
require "sprockets"
require "jsmin"
require "packr"

desc "Builds the distribution."
task :dist do
  lib_dir  = File.expand_path("../lib", __FILE__)
  dist_dir = File.expand_path("../dist", __FILE__)
  
  secretary = Sprockets::Secretary.new(
    :root           => lib_dir,
    :load_path      => [ lib_dir ],
    :source_files   => [ File.join(lib_dir, "classify.js") ],
    :strip_comments => false
  )
  concatenation = secretary.concatenation.to_s
  
  File.open(File.join(dist_dir, "classify.js"), "w") do |file|
    file.write concatenation.strip
  end
  
  File.open(File.join(dist_dir, "classify.min.js"), "w") do |file|
    file.write JSMin.minify(concatenation).strip
  end
  
  File.open(File.join(dist_dir, "classify.pack.js"), "w") do |file|
    file.write Packr.pack(concatenation, :shrink_vars => true).strip
  end
end
