import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BlocklyService {

  constructor(private http: HttpClient) {
  }

  /**
   * 获取xml文件内容
   *
   */
  getXml(path?: string) {
    return this.http.get(path || 'assets/blockly/xmls/demo1.xml', {
      responseType: 'text'
    });
  }
}
