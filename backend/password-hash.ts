import bcrypt from "bcryptjs";
const saltRounds = 10;

/**
 * Hash a password
 * @param {string} password
 * @returns {string}
 */
export function hash(password : string) {
    return bcrypt.hashSync(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param {string} password
 * @param {string} hash
 * @returns {boolean} Does the password match the hash?
 */
export function verify(password : string, hash : string) {
    return bcrypt.compareSync(password, hash);
}

/**
 * Does the hash need to be rehashed?
 * @returns {boolean}
 */
export function needRehash(hash : string) {
    return false;
}
