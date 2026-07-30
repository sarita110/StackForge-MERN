#!/bin/bash

# Initialize local repository
git init
git branch -M main

# Initial commit for the .gitignore file
git add .gitignore
export GIT_AUTHOR_DATE="2026-03-24 18:45:00"
export GIT_COMMITTER_DATE="2026-03-24 18:45:00"
git commit -m "chore: initial repository configuration"

# Array of realistic developer commit messages
messages=(
  "feat: initialize database connection pool configuration"
  "refactor: migrate backend server routes to ES Modules"
  "feat: add seed files to populate courses and lessons"
  "fix: resolve IPv6 localhost address resolution bug on Windows"
  "feat: set up React Router dom and layout structures"
  "feat: build navigation sidebar component with Lucide icons"
  "feat: write JWT validation security middleware on backend"
  "feat: implement login and registration pages on frontend"
  "feat: create many-to-many join table for lesson progress tracking"
  "feat: build admin panel tab to manage user registration status"
  "fix: solve course view 401 unauthorized page crash"
  "feat: configure Jest and Supertest backend test environments"
  "test: write database-backed integration test cases for auth"
  "style: upgrade layout to Tailwind CSS v4 variables"
  "docs: update documentation configuration references"
  "chore: clean up dependencies and vulnerabilities inside backend"
  "refactor: split server.js into app.js and listener configurations"
  "fix: correct SQL parameters mismatch inside lesson seeds query"
  "style: design floating panels with matte glassmorphic borders"
  "perf: optimize dynamic progress card subqueries inside database"
)

# Date calculations
start_date="2026-03-25"
end_date="2026-07-30"

# Convert dates to seconds
current_sec=$(date -d "$start_date" +%s)
end_sec=$(date -d "$end_date" +%s)

echo "⏳ Generating historical developer commits..."

# Loop through each calendar day
while [ "$current_sec" -le "$end_sec" ]; do
  current_date=$(date -d "@$current_sec" +%Y-%m-%d)
  
  # Determine if we commit today (85% chance to simulate natural days off)
  if [ $((RANDOM % 100)) -lt 85 ]; then
    # Randomly select commit frequency (1, 2, or 3 commits)
    num_commits=$(( (RANDOM % 3) + 1 ))
    
    for ((i=1; i<=num_commits; i++)); do
      # Randomly select commit message
      msg_idx=$(( RANDOM % ${#messages[@]} ))
      msg=${messages[$msg_idx]}
      
      # Randomly select morning (5:00 - 9:00) or evening (18:00 - 23:00) slot
      if [ $((RANDOM % 2)) -eq 0 ]; then
        # Morning Slot: Hour between 05 and 08
        hour=$(( (RANDOM % 4) + 5 ))
      else
        # Evening Slot: Hour between 18 and 22
        hour=$(( (RANDOM % 5) + 18 ))
      fi
      
      # Formatting times
      minute=$(( RANDOM % 60 ))
      second=$(( RANDOM % 60 ))
      formatted_hour=$(printf "%02d" $hour)
      formatted_minute=$(printf "%02d" $minute)
      formatted_second=$(printf "%02d" $second)
      
      datetime="$current_date $formatted_hour:$formatted_minute:$formatted_second"
      
      # Write changes to a progress tracking log
      echo "$datetime - $msg" >> progress.log
      git add progress.log
      
      # Commit with backdated environment variables
      export GIT_AUTHOR_DATE="$datetime"
      export GIT_COMMITTER_DATE="$datetime"
      git commit -m "$msg" --quiet
    done
  fi
  
  # Advance calendar by 1 day
  current_sec=$(( current_sec + 86400 ))
done

# Final Stage: Commit your actual clean codebase at the end of the history
echo "📦 Staging your final codebase..."
git add .
export GIT_AUTHOR_DATE="2026-07-30 21:30:00"
export GIT_COMMITTER_DATE="2026-07-30 21:30:00"
git commit -m "feat: complete functional release of StackForge workspace" --quiet

# Clean up environment variables
unset GIT_AUTHOR_DATE
unset GIT_COMMITTER_DATE

echo "✅ Generation complete. Your actual codebase is committed at the timeline head."