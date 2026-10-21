import {readFile,writeFile} from 'node:fs/promises'

/** 从本地素材生成静态帧；原始视频与动画保留，减少动态模式使用派生图像。 */
export async function prepareHelloMondayMotion(browser, root, data, animations) {
  const pairs=[
    ...[...data.extras.services.filter(src=>src.endsWith('.gif')),...animations].map(src=>[src,src.replace(/\.(gif|webp)$/,'-still.webp')]),
    [data.extras.productHero,'/templates/hellomonday/assets/product-poster.webp'],
    [data.extras.hero,'/templates/hellomonday/assets/hero-poster.webp'],
  ]
  for(const [src,file] of pairs) {
    const frame=await browser.evaluate(`(async()=>{const src=${JSON.stringify(src)};const video=src.endsWith('.mp4');const media=document.createElement(video?'video':'img');media.src=src;if(video){media.muted=true;await new Promise((resolve,reject)=>{media.onloadeddata=resolve;media.onerror=reject});media.currentTime=1.5;await new Promise(resolve=>media.onseeked=resolve)}else await media.decode();const canvas=document.createElement('canvas');canvas.width=video?media.videoWidth:media.naturalWidth;canvas.height=video?media.videoHeight:media.naturalHeight;canvas.getContext('2d').drawImage(media,0,0);return canvas.toDataURL('image/webp',.9).split(',')[1]})()`)
    await writeFile(new URL(`public${file}`,root),Buffer.from(frame,'base64'))
  }
  const derived=pairs.map(([source,file])=>({source,file,method:'本地浏览器解码静态帧；授权范围与原素材一致'}))
  const manifestURL=new URL('public/templates/hellomonday/sources.json',root)
  const manifest=JSON.parse(await readFile(manifestURL,'utf8'))
  manifest.derived=derived
  manifest.fonts={family:['Weelume MiSans','Weelume Poppins'],source:'/fonts/brand/',licences:['/fonts/brand/README.md','/fonts/brand/Poppins-OFL.txt']}
  await writeFile(manifestURL,JSON.stringify(manifest,null,2))
  return derived
}
