set -e
cd "$(dirname "$0")"
npx --yes esbuild web/app.ts --bundle --format=iife --minify --outfile=web/app.js --log-level=warning
npx --yes esbuild web/reading.ts --bundle --format=iife --minify --outfile=web/reading.js --log-level=warning
python3 - <<'P'
for t,j,o in [('web/template.html','web/app.js','web/index.html'),('web/reading-template.html','web/reading.js','web/reading.html')]:
    h=open(t).read(); b=open(j).read().replace('</script','<\\/script'); open(o,'w').write(h.replace('/*APP*/',b))
P
