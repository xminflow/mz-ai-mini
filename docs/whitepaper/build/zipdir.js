// 最小 zip 打包器：docx 就是一个 zip，环境里没有 zip 命令，用 Node 自带 zlib 实现。
// 只支持 deflate + store，足够打包 OOXML。
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function walk(dir, base, out) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name)
    const rel = base ? `${base}/${name}` : name
    if (fs.statSync(full).isDirectory()) walk(full, rel, out)
    else out.push({ rel, full })
  }
}

const srcDir = process.argv[2]
const outFile = process.argv[3]
// [Content_Types].xml 必须排在最前，部分解析器依赖这一点
const files = []
walk(srcDir, '', files)
files.sort((a, b) => (a.rel === '[Content_Types].xml' ? -1 : b.rel === '[Content_Types].xml' ? 1 : 0))

const locals = []
const centrals = []
let offset = 0

for (const f of files) {
  const raw = fs.readFileSync(f.full)
  const deflated = zlib.deflateRawSync(raw, { level: 9 })
  const useDeflate = deflated.length < raw.length
  const data = useDeflate ? deflated : raw
  const method = useDeflate ? 8 : 0
  const nameBuf = Buffer.from(f.rel, 'utf8')
  const crc = crc32(raw)

  const local = Buffer.alloc(30 + nameBuf.length)
  local.writeUInt32LE(0x04034b50, 0)
  local.writeUInt16LE(20, 4)
  local.writeUInt16LE(0, 6)
  local.writeUInt16LE(method, 8)
  local.writeUInt16LE(0, 10) // time
  local.writeUInt16LE(0x21, 12) // date 1996-01-01，固定值保证可重复构建
  local.writeUInt32LE(crc, 14)
  local.writeUInt32LE(data.length, 18)
  local.writeUInt32LE(raw.length, 22)
  local.writeUInt16LE(nameBuf.length, 26)
  local.writeUInt16LE(0, 28)
  nameBuf.copy(local, 30)
  locals.push(local, data)

  const central = Buffer.alloc(46 + nameBuf.length)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(20, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(0, 8)
  central.writeUInt16LE(method, 10)
  central.writeUInt16LE(0, 12)
  central.writeUInt16LE(0x21, 14)
  central.writeUInt32LE(crc, 16)
  central.writeUInt32LE(data.length, 20)
  central.writeUInt32LE(raw.length, 24)
  central.writeUInt16LE(nameBuf.length, 28)
  central.writeUInt16LE(0, 30)
  central.writeUInt16LE(0, 32)
  central.writeUInt16LE(0, 34)
  central.writeUInt16LE(0, 36)
  central.writeUInt32LE(0, 38)
  central.writeUInt32LE(offset, 42)
  nameBuf.copy(central, 46)
  centrals.push(central)

  offset += local.length + data.length
}

const centralBuf = Buffer.concat(centrals)
const end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0)
end.writeUInt16LE(0, 4)
end.writeUInt16LE(0, 6)
end.writeUInt16LE(files.length, 8)
end.writeUInt16LE(files.length, 10)
end.writeUInt32LE(centralBuf.length, 12)
end.writeUInt32LE(offset, 16)
end.writeUInt16LE(0, 20)

fs.writeFileSync(outFile, Buffer.concat([...locals, centralBuf, end]))
console.log(`已打包 ${files.length} 个部件 -> ${outFile}`)
