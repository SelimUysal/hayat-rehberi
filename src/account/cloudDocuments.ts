import { allowedKey, MAX_VALUE_LENGTH, validValue } from './syncModel';

export const CHUNK_LENGTH=180_000;
export const MAX_CHUNKS=6;
export const partId=(key:string,index:number)=>`${key}__part_${index}`;
export function splitValue(value:string):string[] {
  if(value.length>MAX_VALUE_LENGTH)throw new Error('Bulut kaydı boyut sınırını aştı.');
  const parts:string[]=[];let part='';
  for(const char of value){if(part.length+char.length>CHUNK_LENGTH){parts.push(part);part='';}part+=char;}
  if(part)parts.push(part);
  return parts;
}
export function decodeProgress(key:string,data:Record<string,any>|undefined,parts:Map<string,Record<string,any>>=new Map()):string|null {
  if(!data)return null;
  let value=data.deleted===true ? null : data.value;
  if(data.schemaVersion===2){
    if(data.deleted!==false || data.value!=='' || !Number.isInteger(data.chunkCount) || data.chunkCount<1 || data.chunkCount>MAX_CHUNKS)throw new Error('Parçalı bulut kaydı doğrulanamadı.');
    value=Array.from({length:data.chunkCount},(_,index)=>{
      const p=parts.get(partId(key,index));
      if(!p || p.schemaVersion!==2 || p.chunkOf!==key || p.index!==index || typeof p.value!=='string' || p.value.length>CHUNK_LENGTH)throw new Error('Bulut kaydının parçaları eksik; cihaz kaydı korundu.');
      return p.value;
    }).join('');
  } else if(data.schemaVersion!==1)throw new Error('Bulut kaydının biçimi desteklenmiyor. Cihaz kaydı korundu.');
  if(!validValue(key,value))throw new Error('Bulut kaydı doğrulanamadı. Cihaz kaydı korundu.');
  return value;
}
export function decodeCollection(documents:Map<string,Record<string,any>>) {
  const values:Record<string,string|null>={};
  for(const [key,data]of documents)if(allowedKey(key))values[key]=decodeProgress(key,data,documents);
  return values;
}
