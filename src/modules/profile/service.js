import mkdirp from 'mkdirp';
import fs from 'fs';
import shortid from 'shortid';

const UPLOAD_DIR = './uploads';
// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

const storeFS = ({ stream, filename }) => {
    const id = shortid.generate();
    const path = `${UPLOAD_DIR}/${id}-${filename}`;
    return new Promise((resolve, reject) =>
        stream
            .on('error', (error) => {
                if (stream.truncated) {
                    // Delete the truncated file.
                    fs.unlinkSync(path);
                    reject(error);
                }
            })
            .pipe(fs.createWriteStream(path))
            .on('error', (error) => reject(error))
            .on('finish', () => resolve({ id, path }))
    );
};

const base64 = (file) => {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
};

const processUpload = async (file, id, models) => {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();
    const { path } = await storeFS({ stream, filename });
    const base64Src = base64(path);
    fs.unlinkSync(path);
    await models.User.update({ avatar: base64Src }, { where: { id } });
    return { filename };
};

export { processUpload };
