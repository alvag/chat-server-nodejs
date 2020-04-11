export default interface UserInterface {
    _id: any;
    name: string;
    email: string;
    phone: string;
    bio: string;
    facebook: string;
    twitter: string;
    password: string;
    avatar: string;
    createdAt: Date;
    deletedAt: Date;
    lastConnection: Date;
    lastMessage: Date;
    active: boolean;
}
