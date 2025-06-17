import api from '../data/api';

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
}

export default ReportCardPresenter; 