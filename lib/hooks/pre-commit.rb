#!/usr/bin/env ruby

require 'fileutils'

staged_files = `git diff --cached --name-only --diff-filter=ACM`

jekyll_files = ["_includes/demo.html", "_includes/demo.css", "_includes/demo.js", "_data/demo.yml"]
jsfiddle_files = ["demo/demo.html", "demo/demo.css", "demo/demo.js", "demo/demo.details"]

for i in 0..3 do
  if(staged_files.include?(jekyll_files[i]) && !staged_files.include?(jsfiddle_files[i]))
    FileUtils.cp jekyll_files[i], jsfiddle_files[i], verbose: true
    puts "Adding #{jsfiddle_files[i]} to the commit"
    system "git add #{jsfiddle_files[i]}"
  elsif(staged_files.include?(jsfiddle_files[i]) && !staged_files.include?(jekyll_files[i]))
    FileUtils.cp jsfiddle_files[i], jekyll_files[i], verbose: true
    puts "Adding #{jekyll_files[i]} to the commit"
    system "git add #{jekyll_files[i]}"
  end
end
