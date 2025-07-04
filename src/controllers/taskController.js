
const newTask = (req, res) => {
  const { task_name,
    description,
    objectives,
    deliverables,
    optional,
    google_link,
    print,
    photo,
    file,
    img,
    doc, } = req.body
  
  
}


const taskController = {
  newTask
}

module.exports = taskController;
