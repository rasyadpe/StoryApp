import api from '../data/api';
import { deleteData } from '../utils/indexed-db-helper';

class ReportCardPresenter {
  constructor() {
    this._api = api;
  }

  async getStoryDetail(id) {
    try {
      const response = await this._api.getStoryDetail(id);
      if (response.error) {
        throw new Error(response.message);
      }
      return response.story;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch story detail');
    }
  }

  async deleteStory(id) {
    try {
      const response = await this._api.deleteStory(id);
      if (response.error) {
        throw new Error(response.message);
      }
      // Delete from IndexedDB as well
      await deleteData(id);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete story');
    }
  }
}

export default ReportCardPresenter; 