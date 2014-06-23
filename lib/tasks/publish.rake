namespace :publishto do
  desc "merges master to gh-pages, copies files to jekyll and pushes to github"
  task :github do

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

      # push
      system "git push origin"

      if(not_gh_pages)
        system "git checkout #{current_branch}"
      end
    end
  end
end
