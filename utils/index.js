/**
 * 10进制转为64进制
 * @param {*} number
 * @returns
 */
const to62 = number => {
  let chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'.split(''),
    radix = chars.length,
    qutient = +number,
    arr = [],
    mod
  do {
    mod = qutient % radix
    qutient = (qutient - mod) / radix
    arr.unshift(chars[mod])
  } while (qutient)
  return arr.join('')
}

let oldTime = 0
export const getKey = () => {
  const time = Date.now()
  if (oldTime >= time) {
    oldTime++
  } else {
    oldTime = time
  }
  return to62(oldTime)
}
