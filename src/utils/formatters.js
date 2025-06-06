import { pick } from 'lodash'
import mime from 'mime-types'
/**
 * Simple method to Convert a String to Slug
 * Các bạn có thể tham khảo thêm kiến thức liên quan ở đây: https://byby.dev/js-slugify-string
 */
export const slugify = val => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
}

/**
 * Example:
 */
// const originalStringTest = 'Một Lập Trình Viên'
// const slug = slugify(originalStringTest)

// console.log('originalStringTest:', originalStringTest)
// console.log('slug:', slug)
/**
 * Results:
 *
 * Original String Test: 'TrungQuanDev Một Lập Trình Viên'
 * Slug Result: trungquandev-mot-lap-trinh-vien
 */
export const pickUser = user => {
  if (!user) return {}
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createAt', 'updateAt'])
}

export const formatMimeType = attachmentFile => {
  return mime.lookup(attachmentFile.originalname)
}

export const formatMimeTypeShort = attachmentFile => {
  return mime.extension(mime.lookup(attachmentFile.originalname))
}
