const { wait_to_resolve } = require("./quieries");
const inquirer = require("inquirer");

const add_employee = (connection) => {
    return new Promise((resolve, reject) => {
        let roles;
        let emps;
        connection.query(`SELECT title AS role, dept_id FROM roles`, (err, saved_roles) => {
            if (err) {
                reject(err);
            }
            roles = saved_roles.map(obj => obj.role);
            connection.query(`SELECT first_name AS first, last_name AS last FROM employees`, (err, saved_emps) => {
                if (err) {
                    reject(err);
                }
                emps = saved_emps.map(obj => obj.first + " " + obj.last);
                emps.push("None");
                inquirer.prompt([
                    {
                        type: "input",
                        message: "Employee's first name:",
                        name: "first_name"
                    },
                    {
                        type: "input",
                        message: "Employee's last name:",
                        name: "last_name"
                    },
                    {
                        type: "list",
                        message: "What is their role?",
                        choices: roles,
                        name: "role"
                    },
                    {
                        type: "list",
                        message: "Who is their manager?",
                        choices: emps,
                        name: "manager"
                    }
                ])
                .then(res => {
                    manager_name = res.manager.split(" ");
                    if (res.manager === "None") {
                        connection.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES
                        (?, ?, (SELECT id FROM roles WHERE roles.title = ?), NULL)`,
                        [res.first_name, res.last_name, res.role],
                        (err, results) => {if (err) {reject(err)}});
                    } else {
                        connection.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id)
                        VALUES
                        (?,
                        ?,
                        (SELECT id FROM roles WHERE roles.title = ?),
                        (SELECT id FROM employees AS e WHERE e.first_name = ? AND e.last_name = ?));`,
                        [res.first_name, res.last_name, res.role, manager_name[0], manager_name[1]],
                        (err, results) => {if (err) {reject(err)}});
                    }
                    console.log(`${res.first_name} ${res.last_name} added to database!`);
                    wait_to_resolve(resolve);
                });
            });
        });
    });
}

module.exports = { add_employee }