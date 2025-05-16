const TaskCard = ({ task, onClick, isDragging }) => {
  const { title, description, assignee, dueDate, badges = [] } = task

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : null

  const isOverdue = dueDate && new Date(dueDate) < new Date() && task.status !== "Done"

  return (
    <div
      onClick={onClick}
      className={`bg-white p-3 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-200 border-l-4 ${
        isOverdue ? "border-red-500" : "border-blue-400"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <h3 className="font-medium text-gray-800 mb-1">{title}</h3>

      {description && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>}

      <div className="flex flex-wrap gap-1 mb-2">
        {badges.map((badge, index) => (
          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
            {badge}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        {assignee ? (
          <div className="flex items-center gap-1">
            <img
              src={
                assignee.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name || assignee.email)}&size=24&background=random`
              }
              alt={assignee.name || assignee.email}
              className="h-5 w-5 rounded-full"
            />
            <span>{assignee.name || assignee.email}</span>
          </div>
        ) : (
          <span>Unassigned</span>
        )}

        {formattedDueDate && <span className={isOverdue ? "text-red-500 font-medium" : ""}>{formattedDueDate}</span>}
      </div>
    </div>
  )
}

export default TaskCard
