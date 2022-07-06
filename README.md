# vkr
В файле CoonsLinearSurface_2D.js представлено построение поверхности Кунса, 4 границы которой заданы естественными кубическими сплайнами, несколькими способами:
- алгебраическим методом, заключающимся в трансфинитной интерполяции граничных кривых,
  при этом параметрические координаты могут быть заданы тремя разными способами: uniform, хордовым и центростремительным;
- дифференциальным методом, основывающимся на методе решения двумерной квазистатической задачи МДТТ из курса МСС с помощью механической аналогии,
  и решении полученных уравнений через конечно-разностные схемы.
  
Файл CoonsLinearSurface_3D.js отражает результаты расширения указанных методов на трехмерный случай.
 
В обоих .html файлах есть возможность выборочного отображения строящихся элементов, таких как контрольные точки, контрольные линии, узловые точки сетки, 
сеточные линии сетки, поверхности, причем итогом работы является их визуальное сравнение.

Анимация поворотов выполнена при помощи кватернионов, а не инструментов css.
