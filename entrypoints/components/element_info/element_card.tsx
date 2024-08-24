import "./css/index.css"
import { Button, Card, Checkbox, CheckboxOptionType, ConfigProvider, GetProp, Input, Tag } from 'antd';
import { getElementStructure } from "@/utlis/dom";
import { CheckOutlined } from '@ant-design/icons';
import { useMouseStore } from "@/entrypoints/store/global";
import { ChangeEvent } from "react";


const CustomTitle = () => {
    return (
        <div className="h-10 flex items-center">
        </div>
    );
};

const CustomInput: React.FC = () => {
    const { element } = useMouseStore();
    const [inputValue, setInputValue] = useState<string>("");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleButtonClick = () => {
        if (element) {
            if (!inputValue) return false;
            element?.classList.add(inputValue);
            setInputValue("");
        }
    };

    return (
        <div className="h-10 px-2  w-full flex items-center justify-center">
            <ConfigProvider
                theme={{
                    components: {
                        Input: {
                            colorBgContainer: '#334155',
                            colorBorder: '#334155',
                            activeBg: '#334155',
                            activeBorderColor: "#334155"
                        },
                    },
                }}
            >
                <div className="w-full flex items-center justify-center">
                    <Input
                        className="h-6 flex-1 text-white"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    {inputValue ?
                        <Button className="ml-2 w-4" size="small" type="primary" icon={<CheckOutlined />} shape="round" onClick={handleButtonClick} />
                        : null}
                </div>

            </ConfigProvider>

        </div>
    );
};

export default () => {
    const { element, setElement } = useMouseStore();
    const [plainOptions, setPlainOptions] = useState<CheckboxOptionType[]>([]);
    const [checkedList, setCheckedList] = useState<string[]>([]);
    const optionsRef = useRef(plainOptions);
    const checkedRef = useRef(checkedList);
    const elementRef = useRef(element);

    useEffect(() => {
        if (element) {
            //dom 变化 CheckedList 重置
            setCheckedList([])
            const updateOptions = () => {
                const toggleOffClass = element.dataset.toggleOffClass
                const toggleOffClassArr = toggleOffClass?.split(' ')
                if (elementRef.current !== element) {
                    setPlainOptions([]);
                    if (element) {
                        const newOptions = Array.from([...element.classList, ...[toggleOffClass ? toggleOffClassArr : []].flat()]).map((className) => ({
                            label: className,
                            value: className,
                        }));
                        setPlainOptions(newOptions);
                    }
                    elementRef.current = element;
                } else if (elementRef.current === element) {
                    // 同一个dom class 有更新
                    elementRef.current.classList.forEach(className => {
                        if (!optionsRef.current.some(option => option.value === className)) {
                            setPlainOptions(prevOptions => [...prevOptions, { label: className, value: className }]);
                        }
                    });
                }
            };

            updateOptions();
            const observer = new MutationObserver(() => {
                updateOptions();
            });

            observer.observe(element, { attributes: true, attributeFilter: ['class'] });
            return () => observer.disconnect();
        }
    }, [element]);

    useEffect(() => {
        optionsRef.current = plainOptions;
        checkedRef.current = checkedList;
        const toggleOffClass = element?.dataset.toggleOffClass
        const opList = optionsRef.current.map(op => op.value);
        const addChecked = opList.filter(item => {
            return !checkedRef.current.includes(item)
        });
        setCheckedList(prevChecked => {
            console.log("checkedList", prevChecked, addChecked)
            return [...prevChecked, ...addChecked.filter(item => {
                return !toggleOffClass?.split(' ').includes(item)
            })]
        });
    }, [element, plainOptions]);


    const handleCheckboxGroupChange: GetProp<typeof Checkbox.Group<string>, 'onChange'> = (list) => {
        //进行更新class
        if (element) {
            //将取消的class 插入 toggle-off-class
            const classList = Array.from(element?.classList);
            const toggleOffClass = element.dataset.toggleOffClass
            const diffClassListToList = classList.filter(className => !list.includes(className));
            const diffListToClassList = list.filter(className => !classList.includes(className));
            //添加新增 toggleOffClass class
            if (diffClassListToList.length) {
                const className = diffClassListToList.toString();
                console.log("添加", className)
                element.dataset.toggleOffClass = toggleOffClass ? `${toggleOffClass} ${className}` : className;;

            }
            //删除失效 toggleOffClass class
            if (diffListToClassList.length) {
                diffListToClassList.forEach(className => {
                    element.dataset.toggleOffClass = toggleOffClass?.split(' ').filter(item => className !== item).join(" ")
                });
            }
            //重置class
            element.classList.value = '';
            list.forEach(className => {
                element.classList.add(className as string);
            });
            setElement(element)
        }
        setCheckedList(list);
    };

    const handleTagClose = (removedOption: string) => {
        setPlainOptions(plainOptions.filter(option => option.value !== removedOption));
        setCheckedList(prev => prev.filter(option => option !== removedOption));
    };



    return (
        <Card
            bordered={false}
            className="w-75 h-92 rounded-md overflow-hidden bg-slate-900 text-white"
        >
            <CustomTitle />
            <div className="flex h-72 flex-col overflow-hidden items-start text-white bg-slate-900">
                <div className="mx-2">
                    {getElementStructure(element)}
                </div>
                <div>
                    <div
                        className=""
                    />
                    {element ? (
                        <div className="mt-2 mx-2 flex flex-wrap items-start h-70 overflow-y-auto"
                            un-scrollbar="~ track-color-gray-800 thumb-color-[#374151] w-4px rounded radius-10px">
                            <Checkbox.Group
                                value={checkedList}
                                onChange={handleCheckboxGroupChange}
                            >
                                {plainOptions.map(option => (
                                    <Tag
                                        key={option.value}
                                        closable
                                        color="#253044"
                                        onClose={() => handleTagClose(option.value)}
                                    >
                                        <Checkbox value={option.value}>
                                            {option.label}
                                        </Checkbox>
                                    </Tag>
                                ))}
                            </Checkbox.Group>
                        </div>
                    ) : 'No element selected'}
                </div>
            </div>
            <CustomInput />
        </Card>
    );
};