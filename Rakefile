require 'rubygems'
require 'packr'

task :default => :dist

desc 'Builds the distribution'
task :dist do
  source = File.read('src/classify.js').sub(/@VERSION/, version)
  header = source.match /((^\s*\/\/.*\n)+)/
  
  File.open('dist/classify.js', 'w') do |file|
    file.write source
  end
  
  File.open('dist/classify.min.js', 'w') do |file|
    file.write header[1]
    file.write Packr.pack(source, :shrink_vars => true).strip
  end
end

desc 'Tags and releases the current version'
task :release do
  guard_clean do
    %x(git tag -am 'Version #{version}' v#{version})
    %x(git push --tags --quiet)
  end
end

desc 'Open up specs in a browser'
task :spec do
  %x(open spec/index.html)
end

def version
  @version ||= File.read('VERSION')
end

def guard_clean
  if %x(git ls-files -dm).split("\n").size.zero?
    yield
  else
    puts 'Commit your changes first...'
  end
end
