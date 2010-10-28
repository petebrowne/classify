require 'packr'

version = '0.10.1'

desc 'Builds the distribution'
task :dist do
  source = File.read 'src/classify.js'
  source.sub!(Regexp.new(Regexp.escape('{{ version }}')), "version #{version}")
  
  package = File.read 'package.json'
  package.sub!(/("version"\s*:\s*")([\w\.]+)/, '\1' + version)
  
  File.open('package.json', 'w') do |file|
    file.write package
  end
  
  File.open('dist/classify.js', 'w') do |file|
    file.write source
  end
  
  File.open('dist/classify.min.js', 'w') do |file|
    file.write Packr.pack(source, :shrink_vars => true).strip
  end
end
task :default => :dist

def guard_clean
  if %x(git ls-files -dm).split("\n").size.zero?
    yield
  else
    puts 'Commit your changes first...'
  end
end

desc 'Tags and releases the current version'
task :release do
  guard_clean do
    %x(git tag -am 'Version #{version}' v#{version})
    %x(git push --tags --quiet)
  end
end

desc 'Publishes the current version on npm'
task :publish do
  guard_clean do
    %x(npm publish .)
  end
end