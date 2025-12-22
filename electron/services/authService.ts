import { StockDatabase } from "../database";
import * as crypto from "crypto";

export class AuthService {
  constructor(private db: StockDatabase) {}

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  async login(username: string, password: string): Promise<boolean> {
    const user = this.db.getUserByUsername(username);
    if (!user) {
      return false;
    }

    const passwordHash = this.hashPassword(password);
    return user.password_hash === passwordHash;
  }

  async createUser(username: string, password: string): Promise<boolean> {
    try {
      // Check if user already exists
      const existingUser = this.db.getUserByUsername(username);
      if (existingUser) {
        throw new Error("Usuario ya existe");
      }

      const passwordHash = this.hashPassword(password);
      this.db.insertUser(username, passwordHash);
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
  }

  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify old password
      const isValid = await this.login(username, oldPassword);
      if (!isValid) {
        throw new Error("Contraseña actual incorrecta");
      }

      const newPasswordHash = this.hashPassword(newPassword);
      return this.db.updateUserPassword(username, newPasswordHash);
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  }

  hasUsers(): boolean {
    return this.db.hasUsers();
  }

  async setupInitialUser(username: string, password: string): Promise<boolean> {
    if (this.hasUsers()) {
      throw new Error("Ya existe un usuario. Use changePassword para cambiar la contraseña.");
    }
    return this.createUser(username, password);
  }
}

