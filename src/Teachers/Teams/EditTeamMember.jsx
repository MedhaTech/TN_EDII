/* eslint-disable no-unused-vars */
/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import './styles.scss';
import { Row, Col, Form, Label } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import Layout from '../Layout';
import { Button } from '../../stories/Button';
import { InputBox } from '../../stories/InputBox/InputBox';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { openNotificationWithIcon, getCurrentUser } from '../../helpers/Utils';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { encryptGlobal } from '../../constants/encryptDecrypt';
import { DropDownWithSearch } from '../../stories/DropdownWithSearch/DropdownWithSearch';

const EditTeamMember = (props) => {
    const { t } = useTranslation();
    const allowedAge = [10, 11, 12, 13, 14, 15, 16, 17, 18];
    const allowedYear = [1, 2, 3, 4, 5];
    // const allowCourse = [1, 2, 3];
    const [listCourse, setListCourse] = useState([]);

    const history = useHistory();
    const currentUser = getCurrentUser('current_user');
    const teamMemberData =
        (history && history.location && history.location.item) || {};
    console.log(teamMemberData && teamMemberData.stream, 'i');

    const formik = useFormik({
        initialValues: {
            student_full_name:
                teamMemberData && teamMemberData.student_full_name,
            age: teamMemberData && teamMemberData.Age,
            gender: teamMemberData && teamMemberData.Gender,
            email: teamMemberData && teamMemberData.email,
            mobile: teamMemberData && teamMemberData.mobile,
            stream_id:
                teamMemberData &&
                teamMemberData.stream &&
                teamMemberData.stream.stream_name,
            date_of_birth: teamMemberData && teamMemberData.date_of_birth,
            year_of_study: teamMemberData && teamMemberData.year_of_study
            // username: teamMemberData && teamMemberData.user.username
        },

        validationSchema: Yup.object({
            student_full_name: Yup.string()
                .required('Please Enter valid Full Name')
                .max(40)
                .matches(
                    /^[A-Za-z0-9\s]*$/,
                    'Please enter only alphanumeric characters'
                )
                .trim(),
            age: Yup.number()
                .test(
                    'age-validation',
                    'Age must be between 14 and 25',
                    function (value) {
                        const currentDate = new Date();
                        const selectedDate = new Date(
                            this.parent.date_of_birth
                        );

                        if (isNaN(selectedDate.getTime())) {
                            return false;
                        }
                        const age =
                            currentDate.getFullYear() -
                            selectedDate.getFullYear();
                        if (isNaN(age) || age < 0) {
                            return false;
                        }
                        return age >= 14 && age <= 25;
                    }
                )
                .default(0),
            gender: Yup.string().required('Please select valid gender'),
            email: Yup.string()
                .required('required')
                .trim()
                .email('Enter Valid Email Id'),

            stream_id: Yup.string().required('Please select Course'),
            year_of_study: Yup.string().required('Please select Year'),

            mobile: Yup.string()
                .required('required')
                .trim()
                .matches(
                    /^\d+$/,
                    'Mobile number is not valid (Enter only digits)'
                )
                .min(10, 'Please enter valid number')
                .max(10, 'Please enter valid number'),
            date_of_birth: Yup.string().required('Please select DOB')
        }),

        onSubmit: (values) => {
            // if (values.username) {
            //     const start = values.username.indexOf('@');
            //     const main = values.username.substring(start);
            //     const checkarry = ['@gmail.com', '@outlook.com', '@yahoo.com'];
            //     const text = checkarry.includes(main);
            //     if (!text) {
            //         openNotificationWithIcon(
            //             'error',
            //             'Email id should end with any of these "@gmail.com,@outlook.com,@yahoo.com"'
            //         );
            //         return;
            //     }
            // }
            const body = {
                team_id: teamMemberData.team_id,
                role: 'STUDENT',
                student_full_name: values.student_full_name,
                Age: values.age,
                Grade: values.grade,

                // // username: values.username,
                stream_id: values.stream_id,
                Gender: values.gender,
                year_of_study: values.year_of_study,
                mobile: values.mobile,
                // username: values.mobile,
                email: values.email,
                data_of_birth: values.date_of_birth
            };
            // if (teamMemberData && teamMemberData.mobile !== values.mobile) {
            //     body['mobile'] = values.email;
            // }
            const teamparamId = encryptGlobal(
                JSON.stringify(teamMemberData.student_id)
            );
            var config = {
                method: 'put',
                url:
                    process.env.REACT_APP_API_BASE_URL +
                    '/students/' +
                    teamparamId,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser?.data[0]?.token}`
                },
                data: body
            };
            axios(config)
                .then(function (response) {
                    if (response.status === 200) {
                        openNotificationWithIcon(
                            'success',
                            'Team Member Update Successfully'
                        );
                        handleView(teamMemberData);
                    } else {
                        openNotificationWithIcon(
                            'error',
                            'Opps! Something Wrong'
                        );
                    }
                })
                .catch(function (error) {
                    openNotificationWithIcon(
                        'error',
                        error?.response?.data?.message
                    );
                });
        }
    });
    console.log(listCourse, 'id');

    const handleView = (item) => {
        history.push({
            pathname: '/teacher/view-team-member',
            item: item
        });
    };
    // const selectCategory = {
    //     label: 'Select Course',
    //     options: [
    //         { label: 'CSE', value: '1' },
    //         { label: 'ECE', value: '2' },
    //         { label: 'EEE', value: '3' },
    //         { label: 'CIVIL', value: '4' }
    //     ],
    //     className: 'defaultDropdown'
    // };
    useEffect(() => {
        CourseList();
    }, []);
    const CourseList = async () => {
        const newparam = encryptGlobal(
            JSON.stringify(currentUser.data[0]?.institution_type_id)
        );

        var config = {
            method: 'get',
            url:
                process.env.REACT_APP_API_BASE_URL +
                `/institutions/Streams/${newparam}`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${currentUser.data[0]?.token}`
            }
        };
        await axios(config)
            .then(function (response) {
                if (response.status === 200) {
                    let dataa = response?.data?.data;
                    if (dataa) {
                        let courseOption = [];
                        dataa.map((item) => {
                            let option = {
                                label: item.stream_name,
                                value: item.stream_id
                            };
                            courseOption.push(option);
                        });
                        setListCourse(courseOption);
                    }
                    // setTotalSubmittedideasCount(
                    //     response.data.data[0].submitted_ideas
                    // );
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };
    const selectCategory = {
        label: 'Select Course',
        options: listCourse,
        className: 'defaultDropdown'
    };
    console.log('selectCategory', selectCategory);
    useEffect(() => {
        const currentDate = new Date();
        const selectedDate = new Date(formik.values.date_of_birth);

        if (!isNaN(selectedDate.getTime())) {
            const age = currentDate.getFullYear() - selectedDate.getFullYear();
            formik.setFieldValue('age', age.toString());
        } else {
            formik.setFieldValue('age', '0');
        }
    }, [formik.values.date_of_birth]);

    return (
        <Layout title="Teams">
            <div className="EditPersonalDetails new-member-page">
                <Row>
                    <Col className="col-xl-10 offset-xl-1 offset-md-0">
                        <h3 className="mb-5">Edit Team Member Details </h3>

                        <div>
                            <Form onSubmit={formik.handleSubmit} isSubmitting>
                                <div className="create-ticket register-blockt">
                                    <Row>
                                        <Row>
                                            <Col md={4}>
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="fullName"
                                                >
                                                    {/* {t(
                                                        'teacher_teams.student_name'
                                                    )} */}
                                                    Student Name
                                                </Label>
                                                <InputBox
                                                    className={'defaultInput'}
                                                    placeholder={t(
                                                        'teacher_teams.student_name_pl'
                                                    )}
                                                    id="student_full_name"
                                                    name="student_full_name"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={
                                                        formik.values
                                                            .student_full_name
                                                    }
                                                />
                                                {formik.touched
                                                    .student_full_name &&
                                                formik.errors
                                                    .student_full_name ? (
                                                    <small className="error-cls">
                                                        {
                                                            formik.errors
                                                                .student_full_name
                                                        }
                                                    </small>
                                                ) : null}
                                            </Col>
                                            <Col md={4} className="mb-0">
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="course_id"
                                                >
                                                    Course
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                {/* <div className="dropdown CalendarDropdownComp ">
                                                    <select
                                                        className="form-control custom-dropdown"
                                                        id="course_id"
                                                        name="course_id"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        value={
                                                            formik.values
                                                                .course_id
                                                        }
                                                    >
                                                        <option value={''}>
                                                            Select Course
                                                        </option>
                                                        {allowCourse.map(
                                                            (item) => (
                                                                <option
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div> */}
                                                <DropDownWithSearch
                                                    {...selectCategory}
                                                    onBlur={formik.handleBlur}
                                                    onChange={(option) => {
                                                        console.log(option);
                                                        formik.setFieldValue(
                                                            'stream_id',
                                                            option?.value
                                                        );
                                                    }}
                                                    value={[
                                                        {
                                                            label:
                                                                teamMemberData &&
                                                                teamMemberData.stream &&
                                                                teamMemberData
                                                                    .stream
                                                                    .stream_name,
                                                            value:
                                                                teamMemberData &&
                                                                teamMemberData.stream &&
                                                                teamMemberData
                                                                    .stream
                                                                    .stream_id
                                                        }
                                                    ]}
                                                    name="Select Course"
                                                    id="Select Course"
                                                />
                                                {formik.touched.stream_id &&
                                                formik.errors.stream_id ? (
                                                    <small className="error-cls">
                                                        {
                                                            formik.errors
                                                                .stream_id
                                                        }
                                                    </small>
                                                ) : null}
                                            </Col>
                                            <Col md={4} className="mb-0">
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="year_of_study"
                                                >
                                                    Year of Study
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="dropdown CalendarDropdownComp ">
                                                    <select
                                                        className="form-control custom-dropdown"
                                                        id="year_of_study"
                                                        name="year_of_study"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        value={
                                                            formik.values
                                                                .year_of_study
                                                        }
                                                    >
                                                        <option value={''}>
                                                            Select the Year
                                                        </option>
                                                        {allowedYear.map(
                                                            (item) => (
                                                                <option
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                                {formik.touched.year_of_study &&
                                                formik.errors.year_of_study ? (
                                                    <small className="error-cls">
                                                        {
                                                            formik.errors
                                                                .year_of_study
                                                        }
                                                    </small>
                                                ) : null}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                md={6}
                                                className="mb-5 mb-xl-0"
                                            >
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="email"
                                                >
                                                    Email Address
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                <InputBox
                                                    className={'defaultInput'}
                                                    placeholder="Enter Email Address"
                                                    id="email"
                                                    name="email"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.email}
                                                />

                                                {formik.touched.email &&
                                                formik.errors.email ? (
                                                    <small className="error-cls">
                                                        {formik.errors.email}
                                                    </small>
                                                ) : null}
                                            </Col>
                                            <Col
                                                md={6}
                                                className="mb-5 mb-xl-0"
                                            >
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="mobile"
                                                >
                                                    Mobile Number
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                <InputBox
                                                    className={'defaultInput'}
                                                    placeholder="Enter Mobile Number"
                                                    id="mobile"
                                                    name="mobile"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.mobile}
                                                />

                                                {formik.touched.mobile &&
                                                formik.errors.mobile ? (
                                                    <small className="error-cls">
                                                        {formik.errors.mobile}
                                                    </small>
                                                ) : null}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                md={6}
                                                className="mb-5 mb-xl-0"
                                            >
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="date_of_birth"
                                                >
                                                    Date of Birth
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                <InputBox
                                                    className={'defaultInput'}
                                                    placeholder="DD/MM/YYYY"
                                                    id="date_of_birth"
                                                    name="date_of_birth"
                                                    type="date"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={
                                                        formik.values
                                                            .date_of_birth
                                                    }
                                                />

                                                {formik.touched.date_of_birth &&
                                                formik.errors.date_of_birth ? (
                                                    <small className="error-cls">
                                                        {
                                                            formik.errors
                                                                .date_of_birth
                                                        }
                                                    </small>
                                                ) : null}
                                            </Col>
                                            <Col
                                                md={3}
                                                className="mb-5 mb-xl-0"
                                            >
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="age"
                                                >
                                                    {/* {t('teacher_teams.age')} */}
                                                    Age
                                                </Label>

                                                <div className="dropdown CalendarDropdownComp ">
                                                    <InputBox
                                                        className={
                                                            'defaultInput'
                                                        }
                                                        isDisabled={true}
                                                        // onChange={
                                                        //     formik.handleChange
                                                        // }
                                                        placeholder="Age"
                                                        id="age"
                                                        name="age"
                                                        type="text"
                                                        value={
                                                            formik.values.age
                                                        }
                                                    />
                                                    {/* <select
                                                        className="form-control custom-dropdown"
                                                        id="age"
                                                        name="age"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        value={
                                                            formik.values.age
                                                        }
                                                    >
                                                        <option value={''}>
                                                            Select Age
                                                        </option>
                                                        {allowedAge.map(
                                                            (item) => (
                                                                <option
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </option>
                                                            )
                                                        )}
                                                    </select> */}
                                                </div>

                                                {formik.touched.age &&
                                                formik.errors.age ? (
                                                    <small className="error-cls">
                                                        {formik.errors.age}
                                                    </small>
                                                ) : null}
                                            </Col>
                                            <Col
                                                md={3}
                                                className="mb-5 mb-xl-0"
                                            >
                                                <Label
                                                    className="name-req-create-member"
                                                    htmlFor="gender"
                                                >
                                                    Gender
                                                    <span
                                                        required
                                                        className="p-1"
                                                    >
                                                        *
                                                    </span>
                                                </Label>

                                                <select
                                                    name="gender"
                                                    className="form-control custom-dropdown"
                                                    value={formik.values.gender}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                >
                                                    <option value="">
                                                        Select Gender
                                                        {/* {t(
                                                            'teacher_teams.student_gender'
                                                        )} */}
                                                    </option>
                                                    <option value="MALE">
                                                        {t(
                                                            'teacher_teams.student_gender_male'
                                                        )}
                                                    </option>
                                                    <option value="FEMALE">
                                                        {t(
                                                            'teacher_teams.student_gender_female'
                                                        )}
                                                    </option>
                                                    <option value="OTHERS">
                                                        Prefer not to mention
                                                    </option>
                                                </select>

                                                {formik.touched.gender &&
                                                formik.errors.gender ? (
                                                    <small className="error-cls">
                                                        {formik.errors.gender}
                                                    </small>
                                                ) : null}
                                            </Col>
                                        </Row>
                                    </Row>
                                </div>

                                <hr className="mt-4 mb-4"></hr>
                                <Row>
                                    <Col className="col-xs-12 col-sm-6">
                                        <Button
                                            label={t('teacher_teams.discard')}
                                            btnClass="secondary"
                                            size="small"
                                            onClick={() =>
                                                props.history.push(
                                                    '/teacher/view-team-member'
                                                )
                                            }
                                        />
                                    </Col>
                                    <Col className="submit-btn col-xs-12 col-sm-6">
                                        <Button
                                            label={t('teacher_teams.submit')}
                                            type="submit"
                                            btnClass={
                                                !(
                                                    formik.dirty &&
                                                    formik.isValid
                                                )
                                                    ? 'default'
                                                    : 'primary'
                                            }
                                            disabled={!formik.dirty}
                                            size="small"
                                        />
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
        </Layout>
    );
};

export default withRouter(EditTeamMember);
