const STATUS_CFG = {
  done:    { label: '✓ Done',    cls: 'badge-done' },
  pending: { label: '⏳ Pending', cls: 'badge-pending' },
  todo:    { label: 'Todo',      cls: 'badge-todo' },
  blocked: { label: '✗ Blocked', cls: 'badge-blocked' },
};

export function AlignmentMatrix({ rows }) {
  if (!rows?.length) return (
    <div className="empty">Chưa có dữ liệu Alignment Matrix — kiểm tra file <code>ALIGNMENT_MATRIX.md</code>.</div>
  );

  return (
    <div className="matrix-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th>Bài học</th>
            <th>Mục tiêu</th>
            <th>Nội dung</th>
            <th>Hoạt động</th>
            <th>Đánh giá</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cfg = STATUS_CFG[row.status] || STATUS_CFG.todo;
            return (
              <tr key={i}>
                <td className="matrix-lesson">{row.lesson}</td>
                <td className="matrix-cell">{row.objective}</td>
                <td className="matrix-cell">{row.content}</td>
                <td className="matrix-cell">{row.activity}</td>
                <td className="matrix-cell">{row.assessment}</td>
                <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
