namespace :ghpages do
  desc "merges master to gh-pages, copies files to jekyll and pushes to github"
  task :publish do

    # merge trunk
    system "git merge master --no-edit"

    # run rake jsfiddle:copy
    Rake::Task['jsfiddle:copy'].execute

    # commit
    system 'git commit -am "Update Github Pages from jsFiddle files."'

    # push
    system 'git push origin'

  end
end
