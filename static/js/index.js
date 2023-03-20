const API_ROOT = '/api/'

const API_AUTH_LOGIN_ENDPOINT = API_ROOT + 'auth/login/';
const API_AUTH_LOGOUT_ENDPOINT = API_ROOT + 'auth/logout/';
const API_SCHEMAS_ENDPOINT = API_ROOT + 'schemas/';
const API_SCHEMA_DATASETS_ENDPOINT = API_ROOT + 'schema-datasets/';
const API_SCHEMA_CREATE_METADATA_ENDPOINT = API_ROOT + 'schema-create-metadata/';


const getAuthToken = () => {
    return localStorage.getItem('token');
}

const getAuthHeader = () => {
    return {
        'Authorization': 'Token ' + getAuthToken()
    }
}

const getCurrUserData = () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

const getCurrUserName = () => {
    const userData = getCurrUserData();
    return userData.username || '';
}

function Home() {
    const token = localStorage.getItem('token');
    return {
        view: () => {
            return m('.container.align-items-center',
                m('.row.justify-content-center', {
                        style: 'margin-top: 290px'
                    },
                    m('.col-4.text-center',
                        m('h2.mb-3', 'FakeCsv'),
                        m('p.lead', 'A tool for generating mock CSV data.'),
                        m('button.btn.btn-lg.btn-primary', {
                            onclick: () => {
                                const path = token ? '/schemas' : '/login';
                                m.route.set(path);
                            }
                        }, 'Try it now')
                    )
                )
            );
        }
    }
}

function Header() {
    const logout = () => {
        m.request({
            url: API_AUTH_LOGOUT_ENDPOINT,
            method: 'POST',
            headers: getAuthHeader(),
        }).then(response => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            m.route.set('/login');
        }).catch(errors => {
        })
    }

    return {
        view: function (vnode) {
            return m("nav.navbar.navbar-expand-lg.navbar-light.bg-light.mb-4", {
                style: "width: 100%; padding: 12px 100px;"
            }, [
                m("a.navbar-brand[href=#]", "FakeCSV"),
                m("button.navbar-toggler[type=button][data-toggle=collapse][data-target=#navbarSupportedContent][aria-controls=navbarSupportedContent][aria-expanded=false][aria-label=Toggle navigation]", [
                    m("span.navbar-toggler-icon")
                ]),
                m(".collapse.navbar-collapse[id=navbarSupportedContent]", [
                    m("ul.navbar-nav.mr-auto", [
                        m("li.nav-item", [
                            m(".nav-link.pointer", {
                                style: 'cursor: pointer;',
                                onclick: function () {
                                    m.route.set('/schemas');
                                }
                            }, "Schemas")
                        ])
                    ])
                ]),
                m("ul.navbar-nav.ml-auto", [
                    m("li.nav-item", {
                        style: "margin-right: 10px;"
                    }, [
                        m("span", "Hello, " + getCurrUserName())
                    ]),
                    m("li.nav-item", [
                        m("a[href=#]", {
                            onclick: logout
                        }, "Logout")
                    ])
                ])
            ]);
        }
    }
}

function Login() {
    let username = '';
    let password = '';

    function submit() {
        m.request({
            method: 'POST',
            url: API_AUTH_LOGIN_ENDPOINT,
            body: {
                username: username,
                password: password,
            },
        }).then(data => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            m.route.set('/schemas');
        }).catch(function (error) {
            console.error(error);
        });
    }

    return {
        view: function () {
            return m(
                'container',
                m('.d-flex.justify-content-center', {
                        style: 'margin-top:150px'
                    },
                    m('.col-md-4.shadow-lg', {
                            style: 'padding: 100px'
                        },
                        [
                            m('h1.text-center.mb-4', 'Login'),
                            m(
                                'form', {
                                    onsubmit: function (event) {
                                        event.preventDefault();
                                        submit();
                                    }
                                },
                                [
                                    m('.form-group.mb-2', [
                                        m('input.form-control[type=text][placeholder=Username]', {
                                            oninput: function (event) {
                                                username = event.target.value;
                                            }
                                        }),
                                    ]),
                                    m('.form-group.mb-3', [
                                        m('input.form-control[type=password][placeholder=Password]', {
                                            oninput: function (event) {
                                                password = event.target.value;
                                            }
                                        }),

                                    ]),
                                    m('button.btn.btn-primary', {
                                        style: 'float: right;'
                                    }, 'Login'),
                                ]
                            ),
                        ]
                    )
                )
            );
        }
    };
}


function SchemasPage() {

    return {
        oninit: function (vnode) {
            vnode.state.loading = true;
            vnode.state.schemas = [];

            m.request({
                method: 'GET',
                url: API_SCHEMAS_ENDPOINT,
                headers: getAuthHeader()
            }).then(data => {
                vnode.state.schemas = data;
                vnode.state.loading = false;
            });
        },

        view: function (vnode) {

            const {
                loading,
                schemas
            } = vnode.state;

            return m(
                '',
                [
                    m(Header()),

                    m('.col.mt-4.body-wrapper',
                        [
                            m('div.d-flex.justify-content-between', [
                                m('h3', 'Data Schemas'),
                                m('button.btn.btn-success.btn-lg', {
                                    onclick: () => {
                                        m.route.set('/schemas/create');
                                    }
                                }, 'New Schema'),
                            ]),
                            loading ?
                                m('p', 'Loading...') :
                                m('table.table', [
                                    m('thead', [
                                        m('tr', [
                                            m('th', '#'),
                                            m('th', 'Name'),
                                            m('th', 'Modified'),
                                            m('th', 'Actions')
                                        ])
                                    ]),
                                    m('tbody', schemas.map((schema, index) => m('tr', [
                                        m('td', index + 1),
                                        m('td.text-primary', {
                                                style: 'cursor: pointer; margin-right: 1rem',
                                                onclick: () => {
                                                    m.route.set(`/schemas/${schema.id}`)
                                                }
                                            },
                                            schema.name),
                                        m('td', schema.modified_at_date),
                                        m('td',
                                            m('div.d-flex',
                                                [
                                                    m('div.text-primary', {
                                                        style: 'cursor: pointer; margin-right: 1rem',
                                                        onclick: () => {
                                                            m.route.set(`/schemas/${schema.id}/edit`)
                                                        }
                                                    }, 'Edit schema'),
                                                    m('div.text-danger', {
                                                        style: 'cursor: pointer;',
                                                        onclick: async () => {
                                                            const confirmDelete = confirm(`Are you sure you want to delete the "${schema.name}" schema?`);

                                                            if (confirmDelete) {
                                                                m.request({
                                                                    method: 'DELETE',
                                                                    url: API_SCHEMAS_ENDPOINT + schema.id,
                                                                    headers: getAuthHeader()
                                                                }).then(response => {
                                                                    vnode.state.schemas = vnode.state.schemas.filter(s => s.id !== schema.id);
                                                                });
                                                            }
                                                        }
                                                    }, 'Delete')
                                                ]
                                            )
                                        )
                                    ])))
                                ])
                        ])

                ]);
        }
    }
}


function deepCopyJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}


const SCHEMA_COLUMN_TEMPLATE = {
    'name': '',
    'data_type': '',
    'min_value': '',
    'max_value': '',
    'order': '',
}

const SCHEMA_TEMPLATE = {
    'name': '',
    'column_separator': ',',
    'string_character': '"',
    'columns': []
}


const SchemaColumnForm = {
    view: (vnode) => {
        const {
            mode,
            columnDataTypeOptions,
            columnData,
            columnErrors = {},
            onChange
        } = vnode.attrs;

        const showMinMaxRange = () => {
            return columnData.data_type === 'text' || columnData.data_type === 'integer' || columnData.data_type === 'date'
        }

        const getError = (fieldName) => {
            if (fieldName in columnErrors) {
                return columnErrors[fieldName][0];
            }
            return null;
        }

        return m('.schema-column-form.mb-3', {
            style: mode === 'create' ? 'padding: 10px; border: 1px solid lightgray; padding: 15px; border-radius: 10px; width: fit-content;' : 'padding: 0px 15px',
        }, [
            m('table', [
                m('thead', [
                    m('tr', [
                        m('td', 'Column name'),
                        m('td', 'Type'),
                        m('td', showMinMaxRange() ? 'Min' : ''),
                        m('td', showMinMaxRange() ? 'Max' : ''),
                        m('td', 'Order'),
                        mode === 'update' && m('th', ''),
                    ]),
                ]),
                m('tbody', [
                    m('tr', [

                        m(
                            'td', {
                                style: 'width:250px; padding-right: 10px'
                            },
                            [
                                m(
                                    'input.form-control' + (getError('name') ? '.is-invalid' : ''), {
                                        type: 'text',
                                        id: 'name-input',
                                        value: columnData.name,
                                        oninput: (e) => {
                                            onChange('name', e.target.value);
                                        },
                                    }),
                            ]),
                        m(
                            'td', {
                                style: 'width: 220px; padding-right: 10px'
                            },
                            [
                                m('select.custom-select.form-control' + (getError('data_type') ? '.is-invalid' : ''), {
                                    id: 'type-input',
                                    value: columnData.data_type,
                                    onchange: (e) => {
                                        onChange('data_type', e.target.value);

                                    },
                                }, columnDataTypeOptions.map((option) =>
                                    m('option', {
                                        value: option[0]
                                    }, option[1])
                                )),
                            ]),

                        m(
                            'td', {
                                style: 'width: 150px; padding-right: 10px'
                            },
                            [
                                showMinMaxRange() && m('input.form-control' + (getError('min_value') ? '.is-invalid' : ''), {
                                    type: 'text',
                                    id: 'min-input',
                                    value: columnData.min_value,
                                    oninput: (e) => {
                                        onChange('min_value', e.target.value);

                                    },
                                }),
                            ]),

                        m(
                            'td', {
                                style: 'width: 150px; padding-right: 10px'
                            },
                            [
                                showMinMaxRange() && m('input.form-control' + (getError('max_value') ? '.is-invalid' : ''), {
                                    type: 'text',
                                    id: 'max-input',
                                    value: columnData.max_value,
                                    oninput: (e) => {
                                        onChange('max_value', e.target.value);

                                    },
                                }),
                            ]),
                        m(
                            'td', {
                                style: 'width: 150px;'
                            },
                            [
                                m('input.form-control' + (getError('order') ? '.is-invalid' : ''), {
                                    type: 'number',
                                    min: '1',
                                    id: 'order-input',
                                    value: columnData.order,
                                    oninput: (e) => {
                                        onChange('order', e.target.value);

                                    },
                                }),
                            ]),

                        mode === 'update' && m(
                            'td', {
                                style: 'width: 100px; padding-right: 10px; padding-left: 15px'
                            },
                            [
                                m('button.btn.btn-danger', {
                                    onclick: () => {
                                        vnode.attrs.onDelete(columnData);
                                    },
                                }, 'Delete'),
                            ]),
                    ]),
                    m('tr',
                        [
                            m('td', getError('name') && m('.text-danger', getError('name'))),
                            m('td', getError('data_type') && m('.text-danger', getError('data_type'))),
                            m('td', getError('min_value') && m('.text-danger', getError('min_value'))),
                            m('td', getError('max_value') && m('.text-danger', getError('max_value'))),
                            m('td', getError('order') && m('.text-danger', getError('order'))),
                        ]
                    )
                ]),
            ]),
            mode === 'create' &&
            m('button.btn.btn-primary.mt-3', {
                onclick: () => {
                    vnode.attrs.onSubmit(columnData);
                },
            }, 'Add column'),
        ]);
    },
};


function SchemaCreateUpdatePage() {
    let schemaErrors = {};
    let columnErrors = {};

    const updateErrorContainers = (errors) => {

        columnErrors = errors['columns'] || {};
        delete errors['columns'];
        schemaErrors = errors;

    }

    const getSchemaError = (fieldName) => {
        if (fieldName in schemaErrors) {
            return schemaErrors[fieldName][0];
        }
        return null;
    }

    const deleteSchemaError = (fieldName) => {
        delete schemaErrors[fieldName];
    }

    const generalColumnsErrorExists = () => {
        return typeof columnErrors[0] === "string";
    }

    const popGeneralColumnsError = () => {

        const errorTxt = columnErrors[0];
        columnErrors = {};

        return errorTxt
    }

    function updateSchema(schemaId, schemaData) {
        m.request({
            method: 'PUT',
            url: API_SCHEMAS_ENDPOINT + schemaId + '/',
            body: schemaData,
            headers: getAuthHeader()
        }).then(data => {
            m.route.set(`/schemas/${schemaId}`)
        }).catch(errors => {
            updateErrorContainers(errors.response);
        });
    }

    function createSchema(schemaData) {
        m.request({
            method: 'POST',
            url: API_SCHEMAS_ENDPOINT,
            body: schemaData,
            headers: getAuthHeader()
        }).then(data => {
            m.route.set(`/schemas/${data.id}`)
        }).catch(errors => {
            updateErrorContainers(errors.response);
        });
    }

    function resetCreateColumnContainer(vnode) {
        vnode.state.createColumnContainer = deepCopyJSON(SCHEMA_COLUMN_TEMPLATE);
    }

    return {
        oninit: async (vnode) => {
            const schemaId = m.route.param("id");

            vnode.state.schemaId = schemaId;
            vnode.state.loading = true;

            let requests = [];

            if (schemaId !== undefined) {
                requests.push(m.request({
                    method: 'GET',
                    url: API_SCHEMAS_ENDPOINT + schemaId,
                    headers: getAuthHeader()
                }).then(data => {
                    vnode.state.schemaData = data;
                    vnode.state.mode = 'update';
                }));
            } else {
                vnode.state.schemaData = deepCopyJSON(SCHEMA_TEMPLATE);
                vnode.state.mode = 'create';
            }

            requests.push(m.request({
                method: 'GET',
                url: API_SCHEMA_CREATE_METADATA_ENDPOINT,
                headers: getAuthHeader()
            }).then(data => {
                vnode.state.columnSeparatorOptions = data.column_separator.choices;
                vnode.state.stringCharacterOptions = data.string_character.choices;
                vnode.state.columnDataTypeOptions = data.column_data_type.choices;
            }));

            await Promise.all(requests);
            vnode.state.loading = false;

            resetCreateColumnContainer(vnode);
        },
        view: (vnode) => {

            const {
                loading,
                columnSeparatorOptions,
                stringCharacterOptions,
                columnDataTypeOptions,
                createColumnContainer,
                schemaId,
                schemaData,
                mode
            } = vnode.state;

            return m('', [
                m(Header),

                // Page content
                m('.body-wrapper', {
                        style: 'width: 1250px'
                    },
                    [
                        m('.row.mt-4', [
                            // New schema name
                            m('.col-6', [
                                m('h3', (mode === 'create' ? 'New' : 'Edit') + ' schema'),
                            ]),

                            // Submit button
                            m('.col-6.text-end', {
                                onclick: () => {
                                    // return;
                                    mode === 'create' ? createSchema(schemaData) : updateSchema(schemaId, schemaData);
                                }
                            }, [
                                m('button.btn.btn-primary', 'Submit'),
                            ]),
                        ]),

                        loading ?
                            m('p', 'Loading...') :
                            m(
                                '.row',
                                [
                                    m(
                                        '.col-4', [
                                            m('label.mt-3', {
                                                for: 'schemaNameInput'
                                            }, 'Name'),
                                            m(
                                                'input.form-control' + (getSchemaError('name') ? '.is-invalid' : ''), {
                                                    type: 'text',
                                                    id: 'schemaNameInput',
                                                    value: schemaData.name,
                                                    oninput: (event) => {
                                                        vnode.state.schemaData.name = event.target.value;
                                                        deleteSchemaError('name')
                                                    },
                                                }),
                                            getSchemaError('name') && m('.text-danger', getSchemaError('name')),

                                            m('label.mt-3', {
                                                for: 'columnSeparatorSelect'
                                            }, 'Column separator'),
                                            m('select.custom-select.form-control', {
                                                id: 'columnSeparatorSelect',
                                                value: schemaData.column_separator,
                                                onchange: (event) => {
                                                    vnode.state.schemaData.column_separator = event.target.value;
                                                },
                                            }, columnSeparatorOptions.map((option) => m('option', {
                                                value: option[0]
                                            }, option[1]))),

                                            m('label.mt-3', {
                                                for: 'stringCharacterSelect'
                                            }, 'String character'),
                                            m('select.custom-select.form-control', {
                                                id: 'stringCharacterSelect',
                                                value: schemaData.string_character,
                                                onchange: (event) => {
                                                    vnode.state.schemaData.string_character = event.target.value;
                                                },
                                            }, stringCharacterOptions.map((option) => m('option', {
                                                value: option[0]
                                            }, option[1]))),

                                        ]
                                    ),
                                    m('h4.mt-4.mb-2', 'Schema columns'),
                                    m('.schema-columns', {
                                        style: 'width: fit-content'
                                    }, [
                                        generalColumnsErrorExists() && m('.mb-2.mt-1.text-danger', popGeneralColumnsError()),
                                        ...schemaData.columns.map((columnData, index) => {
                                            return m(SchemaColumnForm, {
                                                columnData: columnData,
                                                columnErrors: columnErrors[index],
                                                mode: 'update',
                                                columnDataTypeOptions,
                                                onChange: (k, v) => {
                                                    columnData[k] = v;
                                                    delete columnErrors[index][k];
                                                },
                                                onDelete: () => {
                                                    schemaData.columns.splice(index, 1);
                                                    vnode.state.schemaData = schemaData;
                                                    m.redraw();
                                                }
                                            })
                                        }),
                                        m(SchemaColumnForm, {
                                            columnData: createColumnContainer,
                                            mode: 'create',
                                            columnDataTypeOptions,
                                            onChange: (k, v) => {
                                                createColumnContainer[k] = v;
                                            },
                                            onSubmit: (newColumnData) => {
                                                schemaData.columns.push(createColumnContainer);
                                                resetCreateColumnContainer(vnode);
                                                m.redraw();
                                            },
                                        })
                                    ]),
                                ]
                            ),
                    ]
                )

            ])
        },
    }
}

function convertToReadable(str) {
    let newStr = str.replace(/_/g, ' ').toLowerCase();
    return newStr.charAt(0).toUpperCase() + newStr.slice(1);
}

const SchemaDetailTable = {

    oninit: (vnode) => {
        const schemaId = m.route.param('id');

        vnode.state.loading = true;
        vnode.state.schemaData = {};
        vnode.state.schemaId = schemaId;

        m.request({
            method: 'GET',
            url: API_SCHEMAS_ENDPOINT + schemaId + '/',
            headers: getAuthHeader()
        }).then(data => {
            vnode.state.schemaData = data;
            vnode.state.loading = false;
        });
    },
    view: (vnode) => {
        const {
            loading,
            schemaData,
            schemaId
        } = vnode.state;

        return m(
            '',
            !loading && [
                m('.col-4', [
                    m('div.d-flex.align-items-center', [
                        m('h3', schemaData ? `${schemaData.name}` : ''),
                        m('div.text-primary', {
                            style: 'cursor: pointer; margin-left: 1.5rem; font-size: 1.1rem',
                            onclick: () => {
                                m.route.set(`/schemas/${schemaId}/edit`)
                            }
                        }, 'Edit schema')
                    ]),
                    m('table.table.mt-2', [
                        m('thead', [
                            m('tr', [
                                m('th', '#'),
                                m('th', 'Column name'),
                                m('th', 'Column type')
                            ])
                        ]),
                        m('tbody', schemaData.columns.map((column, index) => {
                            return m('tr', [
                                m('td', index + 1),
                                m('td', column.name),
                                m('td', convertToReadable(column.data_type))
                            ])
                        }))
                    ])
                ])
            ])
    }
}


const DataSetsComponent = () => {
    let datasetRows = []
    let processingDatasets = {}
    let numRows = 1;
    let inputErrors = {};

    const generateData = (schemaId, numRows) => {
        m.request({
            method: "POST",
            url: `${API_SCHEMAS_ENDPOINT}${schemaId}/generate-dataset/`,
            body: {
                number_of_rows: numRows
            },
            headers: getAuthHeader(),
        }).then(dataset => {

            processingDatasets[dataset.id] = true
            datasetRows.unshift(dataset)
            scanProcessingDatasets(schemaId)
        }).catch(error => {
            inputErrors = error.response
        })
    }

    const errorsExist = () => {
        return Object.keys(inputErrors).length > 0;
    }

    const popErrorMessage = () => {
        const errorTxt = inputErrors.number_of_rows[0];
        delete inputErrors['number_of_rows'];
        return errorTxt
    }

    const scanProcessingDatasets = (schemaId) => {
        const processingDatasetIds = Object.keys(processingDatasets);
        if (processingDatasetIds.length === 0) {
            return;
        }

        let processingIdsToDelete = [];

        setTimeout(() => {
            processingDatasetIds.forEach((datasetId) => {
                m.request({
                    method: "GET",
                    url: API_SCHEMA_DATASETS_ENDPOINT + datasetId + '/',
                    headers: getAuthHeader()
                }).then(dataset => {

                    const row = datasetRows.find(row => row.id === dataset.id)
                    if (row) {
                        Object.assign(row, dataset)
                        if (row.status === "ready") {
                            delete processingDatasets[row.id];
                            processingIdsToDelete.push(row.id);
                        }
                    }

                })
            });
            for (const id of processingIdsToDelete) {
                delete processingDatasets[id];
            }
            scanProcessingDatasets(schemaId)

        }, 2000);

    }

    const getDatasetRows = (schemaId) => {
        m.request({
            method: "GET",
            url: `${API_SCHEMAS_ENDPOINT}${schemaId}/datasets/`,
            headers: getAuthHeader()
        })
            .then(rows => {

                datasetRows = rows
            })
    }

    return {
        oninit: ({
                     attrs: {
                         schemaId
                     }
                 }) => {
            getDatasetRows(schemaId);
            scanProcessingDatasets(schemaId);
        },
        view: ({
                   attrs: {
                       schemaId
                   }
               }) => {
            return m(
                ".mt-4", {
                    style: 'width: 900px'
                }, [
                    m(".row", [
                        m(".col-md-6", [
                            m("h3", "Data sets"),
                        ]),
                        m(".col-md-6", [
                            m(
                                'div.d-flex.align-items-center.justify-content-end',
                                [
                                    m(
                                        "span", {
                                            style: 'margin-right: 15px'
                                        },
                                        "Rows:"
                                    ),
                                    m(
                                        "input.form-control" + (errorsExist() ? '.is-invalid' : ''), {
                                            style: 'width: 85px;margin-right: 10px',
                                            type: "number",
                                            min: 1,
                                            oninput: (e) => {
                                                numRows = e.target.value;

                                            }
                                        },
                                    ),
                                    m("button.btn.btn-primary", {
                                        onclick: () => {

                                            generateData(schemaId, numRows);
                                        }
                                    }, "Generate data")
                                ]
                            ),
                            errorsExist() && m('.text-end.text-danger', popErrorMessage())
                        ])
                    ]),
                    m("table.table", [
                        m("thead", [
                            m("tr", [
                                m("th", "#"),
                                m("th", "Filename"),
                                m("th", "Created"),
                                m("th", "Status"),
                                m("th", "Actions")
                            ])
                        ]),
                        m("tbody", [
                            datasetRows.map((row, index) => {
                                return m("tr", [
                                    m('td', index + 1),
                                    m('td', row.filename),
                                    m("td", row.created_at_time),
                                    m("td", {
                                            style: 'width: 200px'
                                        },
                                        m('.badge.bg-' + (row.status === 'ready' ? 'success' : 'secondary'),
                                            row.status
                                        )
                                    ),
                                    m("td.text-primary", {
                                            style: 'cursor: pointer',
                                            onclick: () => {
                                                m.route.set(`/schemas/${schema.id}`)
                                            }
                                        },
                                        row.status === "ready" ?
                                            m("a", {
                                                style: 'text-decoration: none;',
                                                href: row.media_file,
                                                download: true
                                            }, "Download") :
                                            null
                                    ),
                                ])
                            })
                        ])
                    ])
                ])
        }
    }

}


const SchemaDetailPage = () => {
    let schema = null;

    return {
        oninit: (vnode) => {
            vnode.state.schemaId = m.route.param('id');
        },

        view: (vnode) => {
            const {
                schemaId
            } = vnode.state;
            const {
                schemaName
            } = vnode

            return m('', [
                [
                    m(Header()),
                    m('.body-wrapper', [
                        m(SchemaDetailTable),
                        m(DataSetsComponent, {
                            schemaId: schemaId
                        }),
                    ])
                ]
            ])
        }
    }
}


const root = document.getElementById("app");

m.route(root, "/", {
    "/": Home,
    "/login": Login,
    '/schemas': SchemasPage,
    '/schemas/create': SchemaCreateUpdatePage,
    '/schemas/:id': SchemaDetailPage,
    '/schemas/:id/edit': SchemaCreateUpdatePage
});