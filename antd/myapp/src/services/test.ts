import {request} from "umi";

export async function getList(){
    return request('/api/testList');
}