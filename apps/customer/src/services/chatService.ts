import { API_CONFIG, ENDPOINTS } from '../constants/api';
import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatResponse {
  response: string;
  intent?: string;
  confidence?: number;
  suggestions?: string[];
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  console.log('[ChatService] ===== CHAT REQUEST START =====');
  console.log('[ChatService] AI_URL:', API_CONFIG.AI_URL);
  console.log('[ChatService] ENDPOINT:', ENDPOINTS.CHAT);
  console.log('[ChatService] Full URL:', API_CONFIG.AI_URL + ENDPOINTS.CHAT);
  console.log('[ChatService] Message:', message);

  // Debug: Check if token exists
  const token = await AsyncStorage.getItem('@agentcare_access_token');
  console.log('[ChatService] Token exists:', !!token);
  console.log('[ChatService] Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

  try {
    console.log('[ChatService] Calling apiClient...');
    const data = await apiClient(ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify({ message }),
      baseUrl: API_CONFIG.AI_URL,
    });

    console.log('[ChatService] Response received:', JSON.stringify(data));
    console.log('[ChatService] Response type:', typeof data);
    console.log('[ChatService] data.message:', data.message);
    console.log('[ChatService] data.response:', data.response);

    return {
      response: data.message || data.response || 'Sorry, I could not process your request.',
      intent: data.intent,
      confidence: data.confidence,
      suggestions: data.suggestions,
    };
  } catch (error: any) {
    console.error('[ChatService] ===== CHAT ERROR =====');
    console.error('[ChatService] Error name:', error?.name);
    console.error('[ChatService] Error message:', error?.message);
    console.error('[ChatService] Error stack:', error?.stack);
    throw error;
  }
}
