// Reproduce the untouched source for visual comparison without changing this checkout.
const fs=require('fs'),path=require('path'),{execFileSync,execSync}=require('child_process');
if(fs.existsSync('_site-baseline/index.html'))process.exit(0); // locally preserved initial build
const target=path.resolve('.cache/a11y-baseline');
if(!fs.existsSync(path.join(target,'.git'))){
 fs.mkdirSync(path.dirname(target),{recursive:true});
 execFileSync('git',['worktree','add','--detach',target,'435d432fb58bb117697e25e7179af72ac91e6b44'],{stdio:'inherit'});
}
const head=execFileSync('git',['-C',target,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(head!=='435d432fb58bb117697e25e7179af72ac91e6b44')throw Error('Unexpected baseline revision');
if(!fs.existsSync(path.join(target,'_site/index.html'))){
 execSync('npm ci --ignore-scripts --no-audit --no-fund',{cwd:target,stdio:'inherit'});
 execSync('npm run build',{cwd:target,stdio:'inherit'});
}
