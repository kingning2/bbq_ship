import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data: any[], fileName: string) => {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(data);
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // 生成excel文件
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });
  
  // 创建 Blob 对象
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // 保存文件
  saveAs(blob, `${fileName}.xlsx`);
}; 