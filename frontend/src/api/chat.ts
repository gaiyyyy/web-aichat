import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface ChatRoom {
  id: number;
  name?: string;
  createdAt?: string;
}

export const chatApi = {
  async sendMessage(roomId: number, userPrompt: string): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/${roomId}/chat`, null, {
      params: { userPrompt }
    });
    return response.data;
  },

  async getRoomList(): Promise<ChatRoom[]> {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  }
};
