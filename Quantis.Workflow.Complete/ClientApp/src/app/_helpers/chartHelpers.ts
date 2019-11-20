export const formatDataLabelForNegativeValues = (dataLabel) => {
    if (dataLabel === -999) {
        return 'NE';
    } else if (dataLabel === -888) {
        return 'NF';
    } else if (dataLabel === -777) {
        return 'NT';
    } else {
        return dataLabel;
    }
}

export const updateChartLabelStyle = (color: string = '#ffffff', shadow: boolean = false, outline: boolean = false) =>{
    let dataLabelsObj = {
        color: color,
        style: {
            textShadow: shadow, 
            textOutline: outline 
        }
    }
    return dataLabelsObj;
}
