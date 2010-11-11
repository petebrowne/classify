require 'packr'

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

task :default => :dist

desc 'Builds the distribution'
task :dist do
  source = File.read 'src/classify.js'
  source.sub!(Regexp.new(Regexp.escape('{{ version }}')), "version #{version}")
  
  File.open('dist/classify.js', 'w') do |file|
    file.write source
  end
  
  File.open('dist/classify.min.js', 'w') do |file|
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
