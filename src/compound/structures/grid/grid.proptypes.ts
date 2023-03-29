import { ContainerProps } from '../../mixins/container'

export type GutterKey =
	| 's0'
	| 's1'
	| 's2'
	| 's3'
	| 's4'
	| 's5'
	| 's6'
	| 's7'
	| 's8'
	| 's9'
	| 's10'
	| 's11'
	| 's12'
	| 's13'
	| 's14'
	| 's15'
	| 's16'
	| 's17'
	| 's18'
	| 's19'
	| 's20'
	| 's21'
	| 's22'
	| 's23'
	| 's24'
	| 's25'

export interface GridProps extends ContainerProps {
	gutter?: GutterKey
}
