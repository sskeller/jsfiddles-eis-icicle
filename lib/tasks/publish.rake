namespace :ghpages do
  desc "merges master to gh-pages, copies files to jekyll and pushes to github"
  task :publish do

    git_status = `git status --short`
    if(git_status != '')
      puts 'Please stash, commit or revert changes.  Exiting.'
    else

      gh_pages = 'gh-pages'
      current_branch = `git rev-parse --abbrev-ref HEAD`
      current_branch.strip!
      not_gh_pages = current_branch != gh_pages

      if(not_gh_pages)
        system "git checkout #{gh_pages}"
      end

      # merge trunk
      system "git merge master --no-edit"

      # run rake jsfiddle:copy
      Rake::Task['copy:tojsfiddle'].execute

      # commit if files are changed
      git_status = `git status --short`
      if(git_status != '')
        system "git add ."
        system 'git commit -m "Update Jekyll files from jsFiddle files [automated]"'
      else
        puts "No changes, skipping commit."
      end

      # push
      system "git push origin"

      if(not_gh_pages)
        system "git checkout #{current_branch}"
      end
    end
  end
end
