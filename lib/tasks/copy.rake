namespace :copyto do
  desc "copy jsfiddle files to jekyll directories"
  task :jsfiddle do
    cp "_includes/demo.js", "demo/demo.js"
    cp "_includes/demo.css", "demo/demo.css"
    cp "_includes/demo.html", "demo/demo.html"
    cp "_data/demo.yml", "demo/demo.details"
  end

  task :jekyll do
  cp "demo/demo.js", "_includes/demo.js"
  cp "demo/demo.css", "_includes/demo.css"
  cp "demo/demo.html", "_includes/demo.html"
  cp "demo/demo.details", "_data/demo.yml"
  end
end
