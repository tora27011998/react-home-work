import { Divider } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Field, Formik, FormikProps } from "formik";
import { useCallback, useState } from "react";
import ButtonWrapped from "../components/Button/ButtonWrapped";
import ModalWrapped from "../components/Modal/ModalWrapped";
import { ISelectProp, SelectWrapped } from "../components/Select/SelectWrapped";
import { TableWrapped } from "../components/Table/TableWrapped";
import { useGetAllClassesQuery } from "../redux/api/classApi";
import { useGetAllStudentByClassIdQuery, usePrefetch } from "../redux/api/studentApi";
import * as Yup from 'yup';


interface DataStudentType {
    studentId: React.Key;
    firstName: string;
    lastName: string;
    isAssigned: boolean;
}
  
export const SettingsPage = () => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [classIdSelected, setClassIdSelected] = useState("");

  const { data: classes, isLoading: isLoadingClasses } = useGetAllClassesQuery({});
  const { data: datasource, isLoading: isLoadingDatasource, isFetching: isFetchingStudent } = useGetAllStudentByClassIdQuery(classIdSelected);
  
  const prefetchFilterStudent = usePrefetch('getAllStudentByClassId')

  const prefetchStudentCB = useCallback(() => {
    prefetchFilterStudent(classIdSelected)
  }, [prefetchFilterStudent, classIdSelected])

  const rowSelection = {
      onChange: (selectedRowKeys: React.Key[], selectedRows: DataStudentType[]) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: (record: DataStudentType) => ({
        disabled: record.isAssigned === true,
        name: record.studentId,
      }),
  };

  const columns: ColumnsType<DataStudentType> = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
    },
    {
      title: 'Status',
      dataIndex: 'isAssigned',
      render: (isAssigned: boolean) => <span>{isAssigned ? "true" : "false"}</span>,
    },
  ];

  const onChangeDropdown = useCallback((val: string) => {
    setClassIdSelected(val);
    prefetchStudentCB();
  }, [prefetchStudentCB]);

  const showModal = useCallback(() => {
    setVisible(true);
  }, []);


  const handleOk = useCallback(() => {
    setConfirmLoading(true);
    
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  }, []);

  const handleCancel = useCallback(() => {
    console.log('Clicked cancel button');
    setVisible(false);
  }, []);

  return (
      <>
          <SelectWrapped onChanged={onChangeDropdown} datasource={classes} isLoading={isLoadingClasses} showSearch={true} style={{width: 400}}/> 

          <ButtonWrapped type={"text"} style={{float: "right"}} onClick={showModal}>Add new student</ButtonWrapped>

          <ModalWrapped 
            title="Add new student" 
            visible={visible} 
            onOk={handleOk} 
            confirmLoading={confirmLoading} 
            onCancel={handleCancel}
          >
            <Formik<FormModel> 
              initialValues={{firstName: "", lastName: "", classId: ''}} 
              validationSchema={Yup.object({
                firstName: Yup.string()
                  .max(15, 'Must be 15 characters or less')
                  .required('Required'),
                lastName: Yup.string()
                  .max(20, 'Must be 20 characters or less')
                  .required('Required'),
              })}
              onSubmit={() => {}}
              component={RegistrationForm} />
          </ModalWrapped >

          <Divider />

          <TableWrapped rowSelection={rowSelection} columns={columns} data={datasource} isLoading={isLoadingDatasource || isFetchingStudent} getRowKey={() => "studentId"}  />
      </>
  );
};



interface FormModel {
  firstName: string,
  lastName: string,
  classId: string
}

let RegistrationForm: (props: FormikProps<FormModel>) => JSX.Element = ({handleSubmit, values, handleChange, setFieldValue, errors, touched}) => {
  const { data: classes } = useGetAllClassesQuery({});  

  return (<form onSubmit={handleSubmit}>
    <div>
      <label>First Name</label>
      <Field name="firstName" />
      {errors.firstName && touched.firstName ? (
              <div>{errors.firstName}</div>
            ) : null}
    </div>
    
    <div>
      <label>Last Name</label>
      <Field name="lastName" />
      {touched.lastName && errors.lastName ? (
        <div>{errors.lastName}</div>
      ) : null}
    </div>
    
    <div>
      <label>Class Id</label>
      <Field as="select" name="classId">
          {classes && classes.map((classItem: ISelectProp, index: number) => <option value={classItem.value} key={index}>{classItem.label}</option>)}
        </Field>
    </div>
    
  </form>)
}


