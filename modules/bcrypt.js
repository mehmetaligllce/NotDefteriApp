import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

const comparePassword = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
}
export default { hashPassword, comparePassword }; 