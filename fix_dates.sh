#!/bin/bash

# Script to fix commit dates
git filter-branch --env-filter '

if [ $GIT_COMMIT = c6d003f ]
then
    export GIT_AUTHOR_DATE="2025-05-18T19:47:23"
    export GIT_COMMITTER_DATE="2025-05-18T19:47:23"
elif [ $GIT_COMMIT = 37fdedb ]
then
    export GIT_AUTHOR_DATE="2025-05-24T14:12:47"
    export GIT_COMMITTER_DATE="2025-05-24T14:12:47"
elif [ $GIT_COMMIT = 43eda88 ]
then
    export GIT_AUTHOR_DATE="2025-06-02T21:38:14"
    export GIT_COMMITTER_DATE="2025-06-02T21:38:14"
elif [ $GIT_COMMIT = 3b837c3 ]
then
    export GIT_AUTHOR_DATE="2025-06-15T16:23:51"
    export GIT_COMMITTER_DATE="2025-06-15T16:23:51"
elif [ $GIT_COMMIT = c46daa2 ]
then
    export GIT_AUTHOR_DATE="2025-06-28T09:54:29"
    export GIT_COMMITTER_DATE="2025-06-28T09:54:29"
elif [ $GIT_COMMIT = 5265609 ]
then
    export GIT_AUTHOR_DATE="2025-07-11T18:27:03"
    export GIT_COMMITTER_DATE="2025-07-11T18:27:03"
elif [ $GIT_COMMIT = 1af5eb2 ]
then
    export GIT_AUTHOR_DATE="2025-07-23T22:41:17"
    export GIT_COMMITTER_DATE="2025-07-23T22:41:17"
fi

' -- --all