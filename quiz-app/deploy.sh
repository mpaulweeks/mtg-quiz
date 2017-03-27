npm run build
mkdir ../docs
rm -r ../docs
mkdir ../docs
cp -a build/ ../docs
# echo 'mtg-quiz.mpaulweeks.com' > ../docs/CNAME
git add .
git commit -m 'deploy'
git push
