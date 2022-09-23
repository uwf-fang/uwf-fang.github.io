import os.path
import re
import shutil
import tarfile as tf
from pathlib import Path
from zipfile import ZipFile

from invoke import task

"""
Instruction:

    Require python 3 and pyinvoke

    Make an empty directory for grading. Put the tasks.py in the directory
    together with the submissions.zip file downloaded from Canvas.

    To run unzip and organization:

        inv organize


Copyright reserved, Ian Fang (xfang@uwf.edu), 2022
"""


def unzip_all(dest='.', archive='submissions.zip'):
    """
    Unzip all files in the destination directory
    :param dest: destination directory
    :param archive: name of the archive file
    """
    if archive.split('.')[-1].lower() != 'zip':
        raise TypeError('File provided is not a zip file!')
    path = (Path(dest) / archive).absolute()
    with ZipFile(str(path), 'r') as zf:
        zf.extractall(str(dest))


@task
def organize(ctx, work_dir='.', remove=True):
    """
    Extract all submission files into sub-directories name as students' name
    """
    root = Path(work_dir)
    unzip_all(root)
    if not root.is_dir():
        raise TypeError('Provided directory {} is not valid!'.format(work_dir))
    name_template = r'([a-zA-Z]+)_(LATE_)?\d+_\d+_(.*)'
    for f in root.iterdir():
        m = re.match(name_template, f.name)
        if m:
            stu_name = m.group(1)
            ext = get_ext(f.name)
            dir_name = get_unique_name(root, stu_name, '{}_v{}')
            if ext in type_handlers:
                type_handlers[ext](f, root / dir_name)
            else:
                type_handlers['unknown'](f, root / 'unknown' / dir_name)
            if remove:
                f.unlink()
        else:
            print('Not a valid individual submission {}! skipped!'.format(f.name))


def get_unique_name(root, name, template):
    """
    Formulate a unique name for a student
      add suffix when name conflict
    :param root: the root where all targets locate
    :param name: the proposed name to use
    :param template: template for suffix addition
    :return: the unique name
    """
    counter = 0
    while (root / name).exists():
        counter += 1
        name = template.format(name, counter)
    return name


def get_ext(filename):
    """
    Get the extension of a given filename (can be a path)
    :param filename: a filename
    :return: the extension of the file name
    """
    exts = type_handlers.keys()
    for ext in exts:
        if filename[-len(ext):] == ext:
            return ext
    return None


def untar(archive, dest):
    """
    Untar all files in the archive into the dest directory
        Assuming that directory structures in archive should be flattened
    """
    if not archive.exists():
        raise FileNotFoundError
    dest.mkdir(parents=True)
    try:
        with tf.open(str(archive), 'r|*') as f:
            for tarinfo in f:
                if tarinfo.isdir():
                    continue
                tarinfo.name = basename(tarinfo.name)
                f.extract(tarinfo, str(dest))
    except:
        print('skipped ' + str(archive))
        return


def unzip(archive, dest):
    """
    Unzip all file in the archive
    """
    if not archive.exists():
        raise FileNotFoundError
    dest.mkdir(parents=True)
    with ZipFile(str(archive), 'r') as zf:
        for zip_info in zf.infolist():
            if zip_info.filename[-1] == '/':
                continue
            zip_info.filename = os.path.basename(zip_info.filename)
            zf.extract(zip_info, str(dest))


def basename(path):
    """
    Get the base name of a given path
    :param path: path to a file
    :return: the base name of a file
    """
    if path[-1] == '/':
        path = path[:-1]
    return path.split('/')[-1]


def copy(file, dest):
    """
    Copy a file to the destination
    :param file: the file to copy
    :param dest: the new place to put the file
    :return: N/A
    """
    if not dest.exists():
        dest.mkdir(parents=True)
    shutil.copy(str(file), str(dest.absolute()))


def eval_dir(ctx):
    tasks = [
        # command line str, order matters
        # 'make -f my.mk clean',
        # 'make',
        # 'make -f my.mk',
        './test_stack1'
    ]
    tasks += [
        './in2post  ../test-files/testcases/test{}.txt'.format(i)
        for i in range(11)
    ]
    report_templ = """command: {}
return code: {}
stdout:
{}
stderr:
{}
"""
    line_delim = "\n" + ("#" * 80) +"\n"
    reports = []
    for t in tasks:
        res = ctx.run(t, warn=True, in_stream=False, hide=True)
        reports.append(
            report_templ.format(
                t,
                res.return_code,
                res.stdout,
                res.stderr
            )
        )
    return line_delim.join(reports)


@task
def evaluate(ctx, out_filename="report.txt", exclude=None, work='.'):
    work = Path(work)
    if not work.exists():
        raise FileNotFoundError('Working directory {} does not exist!'.format(work))
    dirs = [d for d in work.iterdir() if d.is_dir() and not (d.name in system_dir)]
    for d in dirs:
        with ctx.cd(str(d.absolute())):
            report = eval_dir(ctx)
            with open(str(d / out_filename), 'w') as f:
                f.write(report)


def drop_templates_one_student(stu_dir, template_dir, backup_dir):
    """
    Drop template files for one student
    Merge files in a subdirectory
    :param stu_dir: student directory
    :param template_dir: template directory
    :param backup_dir: name of subdirectory to backup
    :return: N/A
    """
    sub = (stu_dir / backup_dir)
    sub.mkdir()
    print('Drop template in {}'.format(stu_dir.name))
    proj_files = [f for f in stu_dir.iterdir() if f.is_file()]
    templ_files = [f for f in template_dir.iterdir() if f.is_file()]
    for f in proj_files:
        shutil.copy(str(f.absolute()), str(sub.absolute()))
    for f in templ_files:
        shutil.copy(str(f.absolute()), str(stu_dir.absolute()))


@task
def drop_templates(ctx, work, template, backup_dir='original'):
    """
    Drop template files into student working directory
    Create subdirectory to hold project files with template files
    :param ctx: context of task
    :param work: working directory with subdirectories for each student
    :param template: directory of template files
    :param backup_dir: name of subdirectory to backup
    :return: N/A
    """
    work = Path(work)
    if not work.exists():
        raise FileNotFoundError('Working directory {} does not exist!'.format(work))
    template = Path(template)
    if not template.exists():
        raise FileNotFoundError('Template directory {} does not exist!'.format(template))
    for d in work.iterdir():
        if d.is_dir() and not (d.name in system_dir or d.name == Path(template).name):  # skip special directories
            drop_templates_one_student(d, template, backup_dir)


# TODO: may support zip file later
type_handlers = {
    'tar.gz': untar,
    'tgz': untar,
    'tar': untar,
    'zip': unzip,
    'unknown': copy
}

system_dir = [
    'unknown',
    'test-files'
]
