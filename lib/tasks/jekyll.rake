namespace :jekyll do
  desc "serve pages locally with jekyll"
  task :serve do

    exec('jekyll serve --baseUrl="" --watch')

  end
end
