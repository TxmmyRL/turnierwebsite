import mongoose, { InferSchemaType, model } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    passwort: {
        type: String,
        required: true,
        select: false
    },
    savedT: {
        type: [
            {
                turnierId: {type: mongoose.Schema.Types.ObjectId, ref: "Turnier", required: false}
            }
        ],
        default: []
    }
});

type UserModel = InferSchemaType<typeof userSchema>;

export default model<UserModel>("User", userSchema);