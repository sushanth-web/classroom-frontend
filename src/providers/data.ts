import {BaseRecord, DataProvider, GetListParams, GetListResponse} from "@refinedev/core";
import * as async_hooks from "node:async_hooks";
import {mock_subjects} from "../../subjects.ts"

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({resource}: GetListParams):Promise<GetListResponse<TData>> => {
    if(resource != 'subjects') {
      return {data: [] as TData[], total:0}
    }

    return {
      data: mock_subjects as unknown as TData[],
      total:mock_subjects.length
    }
  },

  getOne: async () => { throw new Error('This function is not present in mock') },
  create: async () => { throw new Error('This function is not present in mock') },
  update: async () => { throw new Error('This function is not present in mock') },
  deleteOne: async () => { throw new Error('This function is not present in mock') },

  getApiUrl: () => '',

}