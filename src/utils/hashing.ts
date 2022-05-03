import bcrypt from 'bcrypt';


export const hashSync = (data: string) => {
    return bcrypt.hashSync(data, 8);
};

export const compareSync = (data: string, encrypted: string) => {
    return bcrypt.compareSync(data, encrypted);
};
