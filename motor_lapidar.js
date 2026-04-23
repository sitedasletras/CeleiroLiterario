const MotorLapidar = {

normalizeText(text = "") {
return String(text)
.replace(/\r\n/g,"\n")
.replace(/\r/g,"\n")
.replace(/\u00A0/g," ")
.replace(/\t/g,"    ")
.replace(/[ ]{2,}/g," ")
.replace(/\n{3,}/g,"\n\n")
.trim()
},

splitBlocks(text="") {

return this.normalizeText(text)
.split(/\n\s*\n/)
.map(block =>
block
.split("\n")
.map(line => line.trim())
.filter(Boolean)
)
.filter(block => block.length)

},

countWords(text="") {

const clean=this.normalizeText(text)

if(!clean) return 0

return clean
.replace(/\n/g," ")
.split(/\s+/)
.filter(Boolean)
.length

},

applyLightCorrections(text="") {

let out=this.normalizeText(text)

out=out.replace(/\s+,/g,",")
out=out.replace(/\s+\./g,".")
out=out.replace(/\s+!/g,"!")
out=out.replace(/\s+\?/g,"?")
out=out.replace(/\.{4,}/g,"...")
out=out.replace(/!!+/g,"!")
out=out.replace(/\?\?+/g,"?")
out=out.replace(/\bPra mim fazer\b/g,"Para eu fazer")
out=out.replace(/\bpra mim fazer\b/g,"para eu fazer")

return out

},

applyMediumCorrections(text="") {

let out=this.applyLightCorrections(text)

out=out.replace(/\bA gente fomos\b/g,"A gente foi")
out=out.replace(/\ba gente fomos\b/g,"a gente foi")
out=out.replace(/\bmais eu\b/g,"mas eu")
out=out.replace(/\bMais eu\b/g,"Mas eu")

return out

},

classify(text="") {

const blocks=this.splitBlocks(text)

let poetry=0
let prose=0
let totalLines=0

for(const block of blocks){

totalLines+=block.length

const avgLen=

block.reduce(
(sum,line)=>sum+line.length,
0
)/block.length

if(avgLen<55) poetry++
else prose++

}

let primary="híbrido"

if(blocks.length===0)
primary="vazio"

else if(poetry>0 && prose===0)
primary="poesia"

else if(prose>0 && poetry===0)
primary="prosa"

return {

primary,
blocks:blocks.length,
totalLines

}

},

detectAlerts(text=""){

const alerts=[]
const blocks=this.splitBlocks(text)

blocks.forEach((block,i)=>{

const avgLen=

block.reduce(
(sum,line)=>sum+line.length,
0
)/block.length

if(block.length===1 && avgLen<20)
alerts.push(
`Bloco ${i+1}: verso isolado muito curto`
)

if(block.length>1 && avgLen>85)
alerts.push(
`Bloco ${i+1}: bloco longo com aparência de prosa`
)

})

return alerts

},

process(text="",options={}){

const correctionLevel=
options.correctionLevel || "light"

const corrected=

correctionLevel==="medium"
? this.applyMediumCorrections(text)
: this.applyLightCorrections(text)

const classification=
this.classify(corrected)

const alerts=
this.detectAlerts(corrected)

return {

originalText:this.normalizeText(text),

processedText:corrected,

wordCount:this.countWords(corrected),

...classification,

alerts

}

}

}
