namespace :jsfiddle do
  desc "copy jsfiddle files to jekyll directories"
  task :copy do
    cp "demo/demo.js", "_includes/demo.js"
    cp "demo/demo.css", "_includes/demo.css"
    cp "demo/demo.html", "_includes/demo.html"
    cp "demo/demo.details", "_data/demo.yml"
  end
end
